import { useRef } from "react";

import { useForm, SubmitHandler } from "react-hook-form";
import { useAlert } from "react-alert";

import Modal from "../Modal";
import Input from "../Input";
import { useCreateRequestMutation } from "../../services/requestApi";
import useChatConnection from "../../hooks/useChatConnection";
import useRTMClient from "../../hooks/useRTMClient";
import useHandleError from "../../hooks/useHandleError";
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
  const RTMClient = useRTMClient();
  const handleError = useHandleError();
  const alert = useAlert();

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
      alert.error("Could not send an invite request. Please try again");
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
      await RTMClient.sendMessageToPeer(
        { text: PeerMessage.RequestCreated },
        contactId,
      );
      alert.success("Request created successfully!");
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
