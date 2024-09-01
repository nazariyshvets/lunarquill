import { Navigate, useParams } from "react-router-dom";
import { useAlert } from "react-alert";

import ChatLayout from "../components/ChatLayout";
import Loading from "../components/Loading";
import { useGetContactRelationQuery } from "../services/mainService";
import useAuth from "../hooks/useAuth";
import useAppDispatch from "../hooks/useAppDispatch";
import useRTMClient from "../hooks/useRTMClient";
import { setCallModalState, setCallTimeout } from "../redux/rtmSlice";
import { CALL_TIMEOUT_MS } from "../constants/constants";
import PeerMessage from "../types/PeerMessage";
import CallDirection from "../types/CallDirection";
import { ChatTypeEnum } from "../types/ChatType";
import type { UserWithoutPassword } from "../types/User";

const ContactChatPage = () => {
  const { id: contactId } = useParams();

  const { userId } = useAuth();
  const { data: contactRelation, isLoading: isContactRelationLoading } =
    useGetContactRelationQuery({
      userId1: userId ?? "",
      userId2: contactId ?? "",
    });
  const RTMClient = useRTMClient();
  const dispatch = useAppDispatch();
  const alert = useAlert();

  if (isContactRelationLoading) return <Loading />;
  if (!contactRelation) return <Navigate to="/profile" replace={true} />;

  const handleCallBtnClick = async (contact: UserWithoutPassword) => {
    if (contact.isOnline) {
      try {
        await RTMClient.sendMessageToPeer(
          { text: PeerMessage.Call },
          contact._id,
        );
        dispatch(
          setCallModalState({
            callDirection: CallDirection.Outgoing,
            contact,
          }),
        );
        dispatch(
          setCallTimeout(
            window.setTimeout(() => {
              RTMClient.sendMessageToPeer(
                { text: PeerMessage.CallTimedOut },
                contact._id,
              );
              dispatch(setCallModalState(null));
              dispatch(setCallTimeout(null));
              alert.info("The recipient did not respond");
            }, CALL_TIMEOUT_MS),
          ),
        );
      } catch (err) {
        alert.error(`Could not call ${contact.username}. Please try again`);
        console.error(`Error calling ${contact.username}:`, err);
      }
    } else
      alert.info(`${contact.username} is offline. The call cannot be sent`);
  };

  const contact =
    contactRelation.user1._id === contactId
      ? contactRelation.user1
      : contactRelation.user2;

  return (
    <ChatLayout
      contactName={contact.username ?? "Unknown"}
      isContactOnline={contact.isOnline ?? false}
      chatType={ChatTypeEnum.SingleChat}
      chatTargetId={contactId ?? null}
      onCallBtnClick={() => handleCallBtnClick(contact)}
    />
  );
};

export default ContactChatPage;
