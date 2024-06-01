import { useState } from "react";

import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { capitalize } from "lodash";
import { useAlert } from "react-alert";

import RequestItem from "../components/RequestItem";
import Modal from "../components/Modal";
import NoDataBox from "../components/NoDataBox";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAuth from "../hooks/useAuth";
import useAuthRequestConfig from "../hooks/useAuthRequestConfig";
import useChatConnection from "../hooks/useChatConnection";
import useRTMClient from "../hooks/useRTMClient";
import {
  useAcceptRequestMutation,
  useDeclineRequestMutation,
  useGetUserRequestsQuery,
  useCreateWhiteboardRoomMutation,
} from "../services/mainService";
import fetchWhiteboardSdkToken from "../utils/fetchWhiteboardSdkToken";
import type { IPopulatedRequest } from "../../../server/src/models/Request";
import PeerMessage from "../types/PeerMessage";
import { RequestTypeEnum } from "../types/Request";

type RequestAction = "decline" | "accept" | "recall";

const RequestsPage = () => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action?: RequestAction;
    request?: IPopulatedRequest;
  }>({
    isOpen: false,
  });
  const { userId } = useAuth();
  const { data: requests } = useGetUserRequestsQuery(userId ?? "");
  const [declineRequest] = useDeclineRequestMutation();
  const [acceptRequest] = useAcceptRequestMutation();
  const [createWhiteboardRoom] = useCreateWhiteboardRoomMutation();
  const alert = useAlert();
  const chatConnection = useChatConnection();
  const RTMClient = useRTMClient();
  const authRequestConfig = useAuthRequestConfig();

  useDocumentTitle("Inbox/Outbox requests");

  const handleRequestItemBtnClick = (
    action: RequestAction,
    request: IPopulatedRequest,
  ) =>
    setModalState((prevState) => ({
      ...prevState,
      isOpen: true,
      action,
      request,
    }));

  const handleCancel = () =>
    setModalState((prevState) => ({
      ...prevState,
      isOpen: false,
    }));

  const handleSave = async () => {
    const action = modalState.action;
    const request = modalState.request;

    if (action && request) {
      switch (action) {
        case "recall":
          try {
            await declineRequest({
              requestId: request._id,
              uid: userId ?? "",
            }).unwrap();
            await RTMClient.sendMessageToPeer(
              { text: PeerMessage.RequestRecalled },
              request.to._id,
            );
            alert.success("Request is recalled successfully");
          } catch (err) {
            alert.error("Could not recall a request. Please try again");
            console.log(err);
          }
          break;
        case "decline":
          try {
            await Promise.all([
              declineRequest({
                requestId: request._id,
                uid: userId ?? "",
              }).unwrap(),
              ...(request.type === RequestTypeEnum.Join
                ? [
                    await chatConnection.rejectGroupJoinRequest({
                      applicant: request.from._id,
                      groupId: request.channel?.chatTargetId ?? "",
                      reason: "",
                    }),
                  ]
                : []),
              ...(request.type === RequestTypeEnum.Invite
                ? [
                    await chatConnection.rejectGroupInvite({
                      invitee: request.to._id,
                      groupId: request.channel?.chatTargetId ?? "",
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
            alert.error("Could not decline a request. Please try again");
            console.log(err);
          }
          break;
        case "accept":
          try {
            let whiteboardRoomId: string | undefined;

            if (request.type === RequestTypeEnum.Contact) {
              const whiteboardSdkToken =
                await fetchWhiteboardSdkToken(authRequestConfig);
              const whiteboardRoomCreationResponse = await createWhiteboardRoom(
                {
                  sdkToken: whiteboardSdkToken,
                },
              );

              whiteboardRoomId =
                "data" in whiteboardRoomCreationResponse &&
                JSON.parse(whiteboardRoomCreationResponse.data).uuid;
            }

            await Promise.all([
              acceptRequest({
                requestId: request._id,
                uid: userId ?? "",
                whiteboardRoomId: RequestTypeEnum.Contact
                  ? whiteboardRoomId
                  : undefined,
              }).unwrap(),
              ...(request.type === RequestTypeEnum.Join
                ? [
                    await chatConnection.acceptGroupJoinRequest({
                      applicant: request.from._id,
                      groupId: request.channel?.chatTargetId ?? "",
                    }),
                  ]
                : []),
              ...(request.type === RequestTypeEnum.Invite
                ? [
                    await chatConnection.acceptGroupInvite({
                      invitee: request.to._id,
                      groupId: request.channel?.chatTargetId ?? "",
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
            alert.error("Could not accept a request. Please try again");
            console.log(err);
          }
      }
    }

    setModalState({ isOpen: false });
  };

  const inboxRequests = requests?.filter(
    (request) => request.to._id === userId,
  );
  const outboxRequests = requests?.filter(
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
          {inboxRequests && inboxRequests.length > 0 ? (
            <div className="flex flex-col gap-2">
              {inboxRequests.map((request) => (
                <RequestItem
                  key={request._id}
                  type={request.type}
                  context="inbox"
                  username={request.from.username}
                  channelName={request.channel?.name}
                  onDecline={() =>
                    handleRequestItemBtnClick("decline", request)
                  }
                  onAccept={() => handleRequestItemBtnClick("accept", request)}
                />
              ))}
            </div>
          ) : (
            <NoDataBox text="No inbox requests" />
          )}
        </TabPanel>
        <TabPanel>
          {outboxRequests && outboxRequests.length > 0 ? (
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
                  onRecall={() => handleRequestItemBtnClick("recall", request)}
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
          onCancel={handleCancel}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default RequestsPage;
