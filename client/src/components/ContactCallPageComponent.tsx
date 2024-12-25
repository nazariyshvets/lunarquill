import CallPageComponent from "./CallPageComponent";
import { useGetContactByIdQuery } from "../services/contactApi";
import { ChatType } from "../types/ChatType";
import type { PopulatedContact, UserWithoutPassword } from "../types/User";

interface ContactCallPageComponentProps {
  localUserId: string;
  contactRelationId: string;
}

interface Data {
  contactRelation: PopulatedContact;
  remoteUser: UserWithoutPassword;
}

const ContactCallPageComponent = ({
  localUserId,
  contactRelationId,
}: ContactCallPageComponentProps) => {
  const { data: contactRelation } = useGetContactByIdQuery(contactRelationId);
  const remoteUser = contactRelation
    ? contactRelation.user1._id === localUserId
      ? contactRelation.user2
      : contactRelation.user1
    : undefined;
  const data: Data | undefined =
    contactRelation && remoteUser
      ? {
          contactRelation,
          remoteUser,
        }
      : undefined;

  return (
    <CallPageComponent<Data>
      localUserId={localUserId}
      channelId={contactRelationId}
      pageTitle={`Call with ${remoteUser?.username || "unknown"}`}
      data={data}
      chatType={ChatType.SingleChat}
      getChatTargetId={(data) => data.remoteUser._id}
      getChatMembers={(data) => [
        data.contactRelation.user1,
        data.contactRelation.user2,
      ]}
      getWhiteboardRoomId={(data) => data.contactRelation.whiteboardRoomId}
    />
  );
};

export default ContactCallPageComponent;
