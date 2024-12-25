import { useNavigate } from "react-router-dom";
import { useAlert } from "react-alert";

import Modal from "../Modal";
import { useLeaveChannelMutation } from "../../services/channelApi";
import { useDisableWhiteboardRoomMutation } from "../../services/whiteboardApi";
import { useFetchWhiteboardSdkTokenMutation } from "../../services/tokenApi";
import useChatConnection from "../../hooks/useChatConnection";
import useHandleError from "../../hooks/useHandleError";
import useSendMessageToPeer from "../../hooks/useSendMessageToPeer";
import PeerMessage from "../../types/PeerMessage";
import type { UserWithoutPassword } from "../../types/User";
import type { Channel } from "../../types/Channel";

interface LeaveChannelModalProps {
  localUserId: string | null | undefined;
  channel: Channel | undefined;
  channelMembers: UserWithoutPassword[];
  onClose: () => void;
}

const LeaveChannelModal = ({
  localUserId,
  channel,
  channelMembers,
  onClose,
}: LeaveChannelModalProps) => {
  const chatConnection = useChatConnection();
  const [leaveChannel] = useLeaveChannelMutation();
  const [fetchWhiteboardSdkToken] = useFetchWhiteboardSdkTokenMutation();
  const [disableWhiteboardRoom] = useDisableWhiteboardRoomMutation();
  const handleError = useHandleError();
  const navigate = useNavigate();
  const alert = useAlert();
  const sendMessageToPeer = useSendMessageToPeer();

  const handleSave = async () => {
    const channelId = channel?._id;
    const chatTargetId = channel?.chatTargetId;

    if (!localUserId || !channelId || !chatTargetId) {
      alert.error("Could not leave the channel. Please try again");
      return;
    }

    try {
      const chatInfo = await chatConnection.getGroupInfo({
        groupId: chatTargetId,
      });
      const prevChatOwner = chatInfo?.data?.[0]?.owner;
      const { isChannelRemoved, adminId } = await leaveChannel({
        userId: localUserId,
        channelId,
      }).unwrap();

      if (isChannelRemoved) {
        const { token: whiteboardSdkToken } =
          await fetchWhiteboardSdkToken().unwrap();

        await Promise.all([
          disableWhiteboardRoom({
            roomUuid: channel.whiteboardRoomId,
            sdkToken: whiteboardSdkToken,
          }).unwrap(),
          chatConnection.destroyGroup({ groupId: chatTargetId }),
        ]);
      } else {
        if (localUserId === prevChatOwner && adminId) {
          await chatConnection.changeGroupOwner({
            groupId: chatTargetId,
            newOwner: adminId,
          });
        }

        await chatConnection.leaveGroup({ groupId: chatTargetId });
        await Promise.all(
          channelMembers
            .filter((member) => member._id !== localUserId)
            .map((member) =>
              sendMessageToPeer(
                member._id,
                `${PeerMessage.ChannelMemberLeft}__${channelId}`,
              ),
            ),
        );
      }

      navigate("/profile");
      alert.success("You left the channel successfully");
    } catch (err) {
      handleError(
        err,
        "Could not leave the channel. Please try again",
        "Error leaving the channel:",
      );
    }
  };

  return (
    <Modal
      title="Are you sure you want to leave this channel?"
      onCancel={onClose}
      onSave={handleSave}
    />
  );
};

export default LeaveChannelModal;
