import { useState } from "react";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { capitalize } from "lodash";

import RequestItem from "../components/RequestItem";
import Modal from "../components/Modal";
import NoDataBox from "../components/NoDataBox";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAlertMessage from "../hooks/useAlertMessage";
import {
  useGetUserRequestsQuery,
  useDeclineRequestMutation,
  useAcceptRequestMutation,
} from "../services/mainService";
import RTCConfig from "../config/RTCConfig";
import { RequestTypeEnum } from "../types/Request";

type RequestAction = "decline" | "accept" | "recall";

const RequestsPage = () => {
  const userId = RTCConfig.uid.toString();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action?: RequestAction;
    requestId?: string;
  }>({
    isOpen: false,
  });
  const { data } = useGetUserRequestsQuery(userId);
  const [
    declineRequest,
    { isSuccess: isDecliningRequestSuccess, isError: isDecliningRequestError },
  ] = useDeclineRequestMutation();
  const [
    acceptRequest,
    { isSuccess: isAcceptingRequestSuccess, isError: isAcceptingRequestError },
  ] = useAcceptRequestMutation();

  const { setAlertMessage: setDecliningAlertMessage } = useAlertMessage(
    isDecliningRequestSuccess,
    isDecliningRequestError,
  );
  const { setAlertMessage: setAcceptingAlertMessage } = useAlertMessage(
    isAcceptingRequestSuccess,
    isAcceptingRequestError,
  );

  useDocumentTitle("Inbox/Outbox requests");

  const handleRequestItemBtnClick = (
    action: RequestAction,
    requestId: string,
  ) =>
    setModalState((prevState) => ({
      ...prevState,
      isOpen: true,
      action,
      requestId,
    }));

  const inboxRequests = data?.filter((request) => request.to._id === userId);
  const outboxRequests = data?.filter((request) => request.from._id === userId);

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
                    handleRequestItemBtnClick("decline", request._id)
                  }
                  onAccept={() =>
                    handleRequestItemBtnClick("accept", request._id)
                  }
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
                  onRecall={() =>
                    handleRequestItemBtnClick("recall", request._id)
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
          onCancel={() =>
            setModalState((prevState) => ({
              ...prevState,
              isOpen: false,
            }))
          }
          onSave={() => {
            const action = modalState.action;
            const requestId = modalState.requestId;

            if (action && requestId) {
              switch (action) {
                case "decline":
                case "recall":
                  setDecliningAlertMessage(
                    `Request is ${
                      action === "decline" ? "declined" : "recalled"
                    } successfully`,
                  );
                  declineRequest({ requestId, uid: userId });
                  break;
                case "accept":
                  setAcceptingAlertMessage("Request is accepted successfully");
                  acceptRequest({ requestId, uid: userId });
              }
            }

            setModalState({ isOpen: false });
          }}
        />
      )}
    </div>
  );
};

export default RequestsPage;
