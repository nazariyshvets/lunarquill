import CallPageComponent from "./CallPageComponent";
import {
  useGetChannelByIdQuery,
  useGetChannelMembersQuery,
} from "../services/channelApi";
import { Channel } from "../types/Channel";
import { ChatType } from "../types/ChatType";
import type { UserWithoutPassword } from "../types/User";

interface ChannelCallPageComponentProps {
  localUserId: string;
  channelId: string;
}

interface Data {
  channel: Channel;
  channelMembers: UserWithoutPassword[];
}

const ChannelCallPageComponent = ({
  localUserId,
  channelId,
}: ChannelCallPageComponentProps) => {
  const { data: channel } = useGetChannelByIdQuery(channelId);
  const { data: channelMembers = [] } = useGetChannelMembersQuery(channelId);
  const data: Data | undefined =
    channel && !!channelMembers.length
      ? {
          channel,
          channelMembers,
        }
      : undefined;

  return (
    <CallPageComponent<Data>
      localUserId={localUserId}
      channelId={channelId}
      pageTitle={`Call in ${channel?.name || "unknown"} channel`}
      data={data}
      chatType={ChatType.GroupChat}
      getChatTargetId={(data) => data.channel.chatTargetId}
      getChatMembers={(data) => data.channelMembers}
      getWhiteboardRoomId={(data) => data.channel.whiteboardRoomId}
    />
  );
};

export default ChannelCallPageComponent;
