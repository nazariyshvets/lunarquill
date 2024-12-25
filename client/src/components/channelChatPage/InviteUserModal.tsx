import { useRef } from "react";

import { useForm, SubmitHandler } from "react-hook-form";

import Modal from "../Modal";
import Input from "../Input";
import { useCreateRequestMutation } from "../../services/requestApi";
import useChatConnection from "../../hooks/useChatConnection";
import useSendMessageToPeer from "../../hooks/useSendMessageToPeer";
import showToast from "../../utils/showToast";
import handleError from "../../utils/handleError";
import { RequestType } from "../../types/Request";
import PeerMessage from "../../types/PeerMessage";
import type { Channel } from "../../types/Channel";

interface InviteUserModalProps {
  localUserId: string | null | undefined;
  channel: Channel | undefined;
  onClose: () => void;
}

const InviteUserModal = ({
  localUserId,
  channel,
  onClose,
}: InviteUserModalProps) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<{ contactId: string }>();
  const formRef = useRef<HTMLFormElement>(null);
  const [createRequest] = useCreateRequestMutation();
  const chatConnection = useChatConnection();
  const sendMessageToPeer = useSendMessageToPeer();

  const handleSave = () => {
    formRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true }),
    );
  };

  const handleFormSubmit: SubmitHandler<{ contactId: string }> = async ({
    contactId,
  }) => {
    const channelId = channel?._id;
    const chatTargetId = channel?.chatTargetId;

    if (!localUserId || !channelId || !chatTargetId) {
      showToast("error", "Could not send an invite request. Please try again");
      return;
    }

    try {
      await Promise.all([
        createRequest({
          from: localUserId,
          to: contactId,
          type: RequestType.Invite,
          channel: channelId,
        }).unwrap(),
        chatConnection.inviteUsersToGroup({
          groupId: chatTargetId,
          users: [contactId],
        }),
      ]);
      await sendMessageToPeer(contactId, PeerMessage.RequestCreated);
      showToast("success", "Request created successfully!");
      onClose();
    } catch (err) {
      handleError(
        err,
        "Could not send an invite request. Please try again",
        "Error sending an invite request:",
      );
    }
  };

  return (
    <Modal title="Enter user id" onCancel={onClose} onSave={handleSave}>
      <form
        ref={formRef}
        autoComplete="off"
        method="POST"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <Input
          register={register}
          name="contactId"
          errors={errors["contactId"]}
          required
        />
      </form>
    </Modal>
  );
};

export default InviteUserModal;
