import { useParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { useAlert } from "react-alert";

import ChatLayout from "../components/ChatLayout";
import { useGetUserContactsQuery } from "../services/mainService";
import useAppDispatch from "../hooks/useAppDispatch";
import useAuth from "../hooks/useAuth";
import useRTMClient from "../hooks/useRTMClient";
import { setCallModalState } from "../redux/rtmSlice";
import PeerMessage from "../types/PeerMessage";
import CallDirection from "../types/CallDirection";
import { ChatTypeEnum } from "../types/ChatType";

const ContactChatPage = () => {
  const { id: contactId } = useParams();
  const { userId } = useAuth();

  const { data: contacts } = useGetUserContactsQuery(userId ?? skipToken);
  const RTMClient = useRTMClient();
  const dispatch = useAppDispatch();
  const alert = useAlert();

  const contact = contacts?.find((contact) => contact._id === contactId);

  return (
    <ChatLayout
      contactName={contact?.username ?? "Unknown"}
      isContactOnline={contact?.isOnline ?? false}
      chatType={ChatTypeEnum.SingleChat}
      chatTargetId={contactId ?? null}
      onCallBtnClick={() => {
        if (!contact) {
          alert.info("No contact information is available. Please try again");
          return;
        }

        if (contact.isOnline) {
          RTMClient.sendMessageToPeer(
            { text: PeerMessage.AudioCall },
            contact._id,
          );
          dispatch(
            setCallModalState({
              callDirection: CallDirection.Outgoing,
              contact,
            }),
          );
          setTimeout(() => {
            RTMClient.sendMessageToPeer(
              { text: PeerMessage.AudioCallTimedOut },
              contact._id,
            );
            dispatch(setCallModalState(null));
            alert.info("The recipient did not respond");
          }, 30_000);
        } else
          alert.info(`${contact.username} is offline. The call cannot be sent`);
      }}
    />
  );
};

export default ContactChatPage;
