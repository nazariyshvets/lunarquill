import { useState } from "react";

import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { capitalize } from "lodash";
import { skipToken } from "@reduxjs/toolkit/query";

import RequestItem from "../components/RequestItem";
import Modal from "../components/Modal";
import NoDataBox from "../components/NoDataBox";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAuth from "../hooks/useAuth";
import useChatConnection from "../hooks/useChatConnection";
import useSendMessageToPeer from "../hooks/useSendMessageToPeer";
import { useGetUserRequestsQuery } from "../services/userApi";
import { useFetchChannelMembersMutation } from "../services/channelApi";
import {
  useAcceptRequestMutation,
  useDeclineRequestMutation,
} from "../services/requestApi";
import { useCreateWhiteboardRoomMutation } from "../services/whiteboardApi";
import { useFetchWhiteboardSdkTokenMutation } from "../services/tokenApi";
import showToast from "../utils/showToast";
import { type PopulatedRequest, RequestType } from "../types/Request";
import PeerMessage from "../types/PeerMessage";

enum RequestAction {
  Recall = "recall",
  Decline = "decline",
  Accept = "accept",
}

interface ModalState {
  isOpen: boolean;
  action?: RequestAction;
  request?: PopulatedRequest;
}

const RequestsPage = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
  });
  const { userId } = useAuth();
  const { data: requests = [] } = useGetUserRequestsQuery(userId ?? skipToken);
  const [fetchChannelMembers] = useFetchChannelMembersMutation();
  const [declineRequest] = useDeclineRequestMutation();
  const [acceptRequest] = useAcceptRequestMutation();
  const [createWhiteboardRoom] = useCreateWhiteboardRoomMutation();
  const [fetchWhiteboardSdkToken] = useFetchWhiteboardSdkTokenMutation();
  const chatConnection = useChatConnection();
  const sendMessageToPeer = useSendMessageToPeer();

  useDocumentTitle("Inbox/Outbox requests");

  const handleRequestItemBtnClick = (
    action: RequestAction,
    request: PopulatedRequest,
  ) =>
    setModalState((prevState) => ({
      ...prevState,
      isOpen: true,
      action,
      request,
    }));

  const handleModalClose = () => setModalState({ isOpen: false });

  const handleModalSave = async () => {
    const action = modalState.action;
    const request = modalState.request;

    if (action && request) {
      switch (action) {
        case RequestAction.Recall:
          await handleRequestRecall(request);
          break;
        case RequestAction.Decline:
          await handleRequestDecline(request);
          break;
        case RequestAction.Accept:
          await handleRequestAccept(request);
      }
    } else {
      showToast("error", `Could not ${action} the request. Please try again`);
    }

    handleModalClose();
  };

  const handleRequestRecall = async (request: PopulatedRequest) => {
    if (!userId) {
      return;
    }

    try {
      await declineRequest({
        requestId: request._id,
        uid: userId,
      }).unwrap();
      await sendMessageToPeer(request.to._id, PeerMessage.RequestRecalled);
      showToast("success", "Request is recalled successfully");
    } catch (err) {
      showToast("error", "Could not recall the request. Please try again");
      console.error("Error recalling the request:", err);
    }
  };

  const handleRequestDecline = async (request: PopulatedRequest) => {
    const chatTargetId = request.channel?.chatTargetId;

    if (
      !userId ||
      ((request.type === RequestType.Join ||
        request.type === RequestType.Invite) &&
        !chatTargetId)
    ) {
      return;
    }

    try {
      await Promise.all([
        declineRequest({
          requestId: request._id,
          uid: userId,
        }).unwrap(),
        ...(request.type === RequestType.Invite
          ? [
              chatConnection.rejectGroupInvite({
                invitee: request.to._id,
                groupId: chatTargetId,
              }),
            ]
          : []),
      ]);
      await sendMessageToPeer(request.from._id, PeerMessage.RequestDeclined);
      showToast("success", "Request is declined successfully");
    } catch (err) {
      showToast("error", "Could not decline the request. Please try again");
      console.error("Error declining the request:", err);
    }
  };

  const handleRequestAccept = async (request: PopulatedRequest) => {
    const requestId = request._id;
    const peerId = request.from._id;
    const channelId = request.channel?._id;
    const channelChatTargetId = request.channel?.chatTargetId;

    if (!userId || !peerId) {
      return;
    }

    switch (request.type) {
      case RequestType.Contact:
        await handleContactRequestAccept(requestId, userId, peerId);
        break;
      case RequestType.Invite:
        channelId &&
          channelChatTargetId &&
          (await handleInviteRequestAccept(
            requestId,
            userId,
            peerId,
            channelId,
            channelChatTargetId,
          ));
        break;
      case RequestType.Join:
        channelId &&
          (await handleJoinRequestAccept(requestId, userId, peerId, channelId));
    }
  };

  const handleContactRequestAccept = async (
    requestId: string,
    localUserId: string,
    peerId: string,
  ) => {
    try {
      const { token: whiteboardSdkToken } =
        await fetchWhiteboardSdkToken().unwrap();
      const createWhiteboardRoomResponse = await createWhiteboardRoom({
        sdkToken: whiteboardSdkToken,
      }).unwrap();
      const whiteboardRoomId = JSON.parse(createWhiteboardRoomResponse).uuid;

      await acceptRequest({
        requestId,
        uid: localUserId,
        whiteboardRoomId,
      }).unwrap();
      await sendMessageToPeer(peerId, PeerMessage.ContactRequestAccepted);
      showToast("success", "Contact request is accepted successfully");
    } catch (err) {
      showToast(
        "error",
        "Could not accept the contact request. Please try again",
      );
      console.error("Error accepting the contact request:", err);
    }
  };

  const handleInviteRequestAccept = async (
    requestId: string,
    localUserId: string,
    peerId: string,
    channelId: string,
    channelChatTargetId: string,
  ) => {
    try {
      await chatConnection.acceptGroupInvite({
        invitee: localUserId,
        groupId: channelChatTargetId,
      });
      await acceptRequest({
        requestId,
        uid: localUserId,
      }).unwrap();
      const channelMembers = await fetchChannelMembers(channelId).unwrap();
      await Promise.all([
        sendMessageToPeer(peerId, PeerMessage.InviteRequestAccepted),
        channelMembers
          .filter((member) => member._id !== localUserId)
          .map((member) =>
            sendMessageToPeer(
              member._id,
              `${PeerMessage.ChannelMemberJoined}__${channelId}`,
            ),
          ),
      ]);
      showToast("success", "Invite request is accepted successfully");
    } catch (err) {
      showToast(
        "error",
        "Could not accept the invite request. Please try again",
      );
      console.error("Error accepting the invite request:", err);
    }
  };

  const handleJoinRequestAccept = async (
    requestId: string,
    localUserId: string,
    peerId: string,
    channelId: string,
  ) => {
    try {
      await acceptRequest({
        requestId,
        uid: localUserId,
      }).unwrap();
      const channelMembers = await fetchChannelMembers(channelId).unwrap();
      await Promise.all([
        sendMessageToPeer(peerId, PeerMessage.JoinRequestAccepted),
        channelMembers
          .filter((member) => ![localUserId, peerId].includes(member._id))
          .map((member) =>
            sendMessageToPeer(
              member._id,
              `${PeerMessage.ChannelMemberJoined}__${channelId}`,
            ),
          ),
      ]);
      showToast("success", "Join request is accepted successfully");
    } catch (err) {
      showToast("error", "Could not accept the join request. Please try again");
      console.error("Error accepting the join request:", err);
    }
  };

  const inboxRequests = requests.filter((request) => request.to._id === userId);
  const outboxRequests = requests.filter(
    (request) => request.from._id === userId,
  );

  return (
    <div className="flex h-full w-full flex-col justify-center gap-12">
      <h1 className="text-center text-2xl font-bold text-white sm:text-3xl xl:text-4xl">
        Inbox/Outbox requests
      </h1>

      <Tabs>
        <TabList>
          <Tab>Inbox</Tab>
          <Tab>Outbox</Tab>
        </TabList>

        <TabPanel>
          {inboxRequests.length > 0 ? (
            <div className="flex flex-col gap-2">
              {inboxRequests.map((request) => (
                <RequestItem
                  key={request._id}
                  type={request.type}
                  context="inbox"
                  username={request.from.username}
                  userAvatarId={request.from.selectedAvatar}
                  channelName={request.channel?.name}
                  channelAvatarId={request.channel?.selectedAvatar}
                  onDecline={() =>
                    handleRequestItemBtnClick(RequestAction.Decline, request)
                  }
                  onAccept={() =>
                    handleRequestItemBtnClick(RequestAction.Accept, request)
                  }
                />
              ))}
            </div>
          ) : (
            <NoDataBox text="No inbox requests" />
          )}
        </TabPanel>
        <TabPanel>
          {outboxRequests.length > 0 ? (
            <div className="flex flex-col gap-2">
              {outboxRequests.map((request) => (
                <RequestItem
                  key={request._id}
                  type={request.type}
                  context="outbox"
                  username={
                    request.type === RequestType.Join
                      ? (request.channel?.name ?? "Unknown")
                      : request.to.username
                  }
                  userAvatarId={
                    request.type === RequestType.Join
                      ? request.channel?.selectedAvatar
                      : request.to.selectedAvatar
                  }
                  channelName={request.channel?.name ?? "Unknown"}
                  channelAvatarId={request.channel?.selectedAvatar}
                  onRecall={() =>
                    handleRequestItemBtnClick(RequestAction.Recall, request)
                  }
                />
              ))}
            </div>
          ) : (
            <NoDataBox text="No outbox requests" />
          )}
        </TabPanel>
      </Tabs>

      {modalState.isOpen && (
        <Modal
          title={`Are you sure you want to ${modalState.action} this request`}
          saveBtnText={capitalize(modalState.action)}
          onCancel={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default RequestsPage;
