import { useRef } from "react";

import { useForm, SubmitHandler } from "react-hook-form";

import Modal from "../Modal";
import Input from "../Input";
import { useUpdateChannelMutation } from "../../services/channelApi";
import useSendMessageToPeer from "../../hooks/useSendMessageToPeer";
import showToast from "../../utils/showToast";
import PeerMessage from "../../types/PeerMessage";
import type { UserWithoutPassword } from "../../types/User";
import type { Channel } from "../../types/Channel";

interface EditChannelPrivacyModalProps {
  localUserId: string | null | undefined;
  channel: Channel | undefined;
  channelMembers: UserWithoutPassword[];
  onClose: () => void;
}

const EditChannelPrivacyModal = ({
  localUserId,
  channel,
  channelMembers,
  onClose,
}: EditChannelPrivacyModalProps) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<{ isChannelPrivate: boolean }>({
    defaultValues: { isChannelPrivate: channel?.isPrivate ?? false },
  });
  const formRef = useRef<HTMLFormElement>(null);
  const [updateChannel] = useUpdateChannelMutation();
  const sendMessageToPeer = useSendMessageToPeer();

  const handleSave = () => {
    formRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true }),
    );
  };

  const handleFormSubmit: SubmitHandler<{
    isChannelPrivate: boolean;
  }> = async ({ isChannelPrivate }) => {
    if (localUserId && channel) {
      try {
        if (isChannelPrivate !== channel.isPrivate) {
          await updateChannel({
            localUserId,
            channelId: channel._id,
            updateData: { isPrivate: isChannelPrivate },
          }).unwrap();
          await Promise.all(
            channelMembers
              .filter((member) => member._id !== localUserId)
              .map((member) =>
                sendMessageToPeer(
                  member._id,
                  `${PeerMessage.ChannelUpdated}__${channel._id}`,
                ),
              ),
          );
        }

        showToast("success", "Channel privacy was updated successfully");
        onClose();
      } catch (err) {
        showToast(
          "error",
          "Could not update channel privacy. Please try again",
        );
        console.error("Error updating channel privacy:", err);
      }
    }
  };

  return (
    <Modal
      title="Change channel privacy"
      onCancel={onClose}
      onSave={handleSave}
    >
      <form
        ref={formRef}
        autoComplete="off"
        method="POST"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <Input
          register={register}
          type="checkbox"
          name="isChannelPrivate"
          errors={errors["isChannelPrivate"]}
          label="Private"
        />
      </form>
    </Modal>
  );
};

export default EditChannelPrivacyModal;
