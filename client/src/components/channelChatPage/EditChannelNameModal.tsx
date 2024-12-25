import { useRef } from "react";

import { useForm, SubmitHandler } from "react-hook-form";
import { useAlert } from "react-alert";

import Modal from "../Modal";
import Input from "../Input";
import { useUpdateChannelMutation } from "../../services/channelApi";
import useSendMessageToPeer from "../../hooks/useSendMessageToPeer";
import PeerMessage from "../../types/PeerMessage";
import type { UserWithoutPassword } from "../../types/User";

interface EditChannelNameModalProps {
  localUserId: string | null | undefined;
  channelId: string | undefined;
  channelName: string | undefined;
  channelMembers: UserWithoutPassword[];
  onClose: () => void;
}

const EditChannelNameModal = ({
  localUserId,
  channelId,
  channelName: sourceChannelName,
  channelMembers,
  onClose,
}: EditChannelNameModalProps) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<{ channelName: string }>({
    defaultValues: { channelName: sourceChannelName },
  });
  const formRef = useRef<HTMLFormElement>(null);
  const [updateChannel] = useUpdateChannelMutation();
  const alert = useAlert();
  const sendMessageToPeer = useSendMessageToPeer();

  const handleSave = () => {
    formRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true }),
    );
  };

  const handleFormSubmit: SubmitHandler<{ channelName: string }> = async ({
    channelName,
  }) => {
    if (localUserId && channelId) {
      try {
        if (channelName !== sourceChannelName) {
          await updateChannel({
            localUserId,
            channelId,
            updateData: { name: channelName },
          }).unwrap();
          await Promise.all(
            channelMembers
              .filter((member) => member._id !== localUserId)
              .map((member) =>
                sendMessageToPeer(
                  member._id,
                  `${PeerMessage.ChannelUpdated}__${channelId}`,
                ),
              ),
          );
        }

        alert.success("Channel information was updated successfully");
        onClose();
      } catch (err) {
        alert.error("Could not update channel name. Please try again");
        console.error("Error updating channel name:", err);
      }
    }
  };

  return (
    <Modal title="Enter channel name" onCancel={onClose} onSave={handleSave}>
      <form
        ref={formRef}
        autoComplete="off"
        method="POST"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <Input
          register={register}
          name="channelName"
          errors={errors["channelName"]}
          required
        />
      </form>
    </Modal>
  );
};

export default EditChannelNameModal;
