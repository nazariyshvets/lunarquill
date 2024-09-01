import { useState } from "react";

import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { capitalize } from "lodash";
import { useAlert } from "react-alert";
import { skipToken } from "@reduxjs/toolkit/query";

import RequestItem from "../components/RequestItem";
import Modal from "../components/Modal";
import NoDataBox from "../components/NoDataBox";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAuth from "../hooks/useAuth";
import useChatConnection from "../hooks/useChatConnection";
import useRTMClient from "../hooks/useRTMClient";
import {
  useAcceptRequestMutation,
  useDeclineRequestMutation,
  useGetUserRequestsQuery,
  useCreateWhiteboardRoomMutation,
  useFetchWhiteboardSdkTokenMutation,
} from "../services/mainService";
import type { PopulatedRequest } from "../types/Request";
import PeerMessage from "../types/PeerMessage";
import { RequestTypeEnum } from "../types/Request";

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
  const [declineRequest] = useDeclineRequestMutation();
  const [acceptRequest] = useAcceptRequestMutation();
  const [createWhiteboardRoom] = useCreateWhiteboardRoomMutation();
  const [fetchWhiteboardSdkToken] = useFetchWhiteboardSdkTokenMutation();
  const alert = useAlert();
  const chatConnection = useChatConnection();
  const RTMClient = useRTMClient();

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
      alert.error(`Could not ${action} the request. Please try again`);
    }

    handleModalClose();
  };

  const handleRequestRecall = async (request: PopulatedRequest) => {
    if (!userId) return;

    try {
      await declineRequest({
        requestId: request._id,
        uid: userId,
      }).unwrap();
      await RTMClient.sendMessageToPeer(
        { text: PeerMessage.RequestRecalled },
        request.to._id,
      );
      alert.success("Request is recalled successfully");
    } catch (err) {
      alert.error("Could not recall the request. Please try again");
      console.error("Error recalling the request:", err);
    }
  };

  const handleRequestDecline = async (request: PopulatedRequest) => {
    const chatTargetId = request.channel?.chatTargetId;

    if (!userId || !chatTargetId) return;

    try {
      await Promise.all([
        declineRequest({
          requestId: request._id,
          uid: userId,
        }).unwrap(),
        ...(request.type === RequestTypeEnum.Join
          ? [
              await chatConnection.rejectGroupJoinRequest({
                applicant: request.from._id,
                groupId: chatTargetId,
                reason: "",
              }),
            ]
          : []),
        ...(request.type === RequestTypeEnum.Invite
          ? [
              await chatConnection.rejectGroupInvite({
                invitee: request.to._id,
                groupId: chatTargetId,
              }),
            ]
          : []),
      ]);
      await RTMClient.sendMessageToPeer(
        { text: PeerMessage.RequestDeclined },
        request.from._id,
      );
      alert.success("Request is declined successfully");
    } catch (err) {
      alert.error("Could not decline the request. Please try again");
      console.error("Error declining the request:", err);
    }
  };

  const handleRequestAccept = async (request: PopulatedRequest) => {
    const channelChatId = request.channel?.chatTargetId;

    if (
      !userId ||
      ((request.type === RequestTypeEnum.Join ||
        request.type === RequestTypeEnum.Invite) &&
        !channelChatId)
    )
      return;

    try {
      let whiteboardRoomId: string | undefined;

      if (request.type === RequestTypeEnum.Contact) {
        const { token: whiteboardSdkToken } =
          await fetchWhiteboardSdkToken().unwrap();

        const createWhiteboardRoomResponse = await createWhiteboardRoom({
          sdkToken: whiteboardSdkToken,
        }).unwrap();
        whiteboardRoomId = JSON.parse(createWhiteboardRoomResponse).uuid;
      }

      await Promise.all([
        acceptRequest({
          requestId: request._id,
          uid: userId,
          whiteboardRoomId: RequestTypeEnum.Contact
            ? whiteboardRoomId
            : undefined,
        }).unwrap(),
        ...(request.type === RequestTypeEnum.Join && channelChatId
          ? [
              await chatConnection.acceptGroupJoinRequest({
                applicant: request.from._id,
                groupId: channelChatId,
              }),
            ]
          : []),
        ...(request.type === RequestTypeEnum.Invite && channelChatId
          ? [
              await chatConnection.acceptGroupInvite({
                invitee: request.to._id,
                groupId: channelChatId,
              }),
            ]
          : []),
      ]);
      await RTMClient.sendMessageToPeer(
        {
          text:
            request.type === RequestTypeEnum.Contact
              ? PeerMessage.ContactRequestAccepted
              : request.type === RequestTypeEnum.Join
                ? PeerMessage.JoinRequestAccepted
                : PeerMessage.InviteRequestAccepted,
        },
        request.from._id,
      );
      alert.success("Request is accepted successfully");
    } catch (err) {
      alert.error("Could not accept the request. Please try again");
      console.error("Error accepting the request:", err);
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
                  channelName={request.channel?.name}
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
                    request.type === RequestTypeEnum.Join
                      ? request.channel?.name ?? "Unknown"
                      : request.to.username
                  }
                  channelName={request.channel?.name}
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
