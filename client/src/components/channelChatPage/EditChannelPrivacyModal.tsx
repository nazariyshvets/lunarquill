import { useRef } from "react";

import { useForm, SubmitHandler } from "react-hook-form";
import { useAlert } from "react-alert";

import Modal from "../Modal";
import Input from "../Input";
import { useUpdateChannelMutation } from "../../services/channelApi";
import useRTMClient from "../../hooks/useRTMClient";
import PeerMessage from "../../types/PeerMessage";
import type { UserWithoutPassword } from "../../types/User";

interface EditChannelPrivacyModalProps {
  localUserId: string | null | undefined;
  channelId: string | null | undefined;
  isChannelPrivate: boolean | undefined;
  channelMembers: UserWithoutPassword[];
  onClose: () => void;
}

const EditChannelPrivacyModal = ({
  localUserId,
  channelId,
  isChannelPrivate: sourceIsChannelPrivate,
  channelMembers,
  onClose,
}: EditChannelPrivacyModalProps) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<{ isChannelPrivate: boolean }>({
    defaultValues: { isChannelPrivate: sourceIsChannelPrivate },
  });
  const formRef = useRef<HTMLFormElement>(null);
  const RTMClient = useRTMClient();
  const [updateChannel] = useUpdateChannelMutation();
  const alert = useAlert();

  const handleSave = () => {
    formRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true }),
    );
  };

  const handleFormSubmit: SubmitHandler<{
    isChannelPrivate: boolean;
  }> = async ({ isChannelPrivate }) => {
    if (localUserId && channelId) {
      try {
        if (isChannelPrivate !== sourceIsChannelPrivate) {
          await updateChannel({
            localUserId,
            channelId,
            updateData: { isPrivate: isChannelPrivate },
          }).unwrap();
          await Promise.all(
            channelMembers
              .filter((member) => member._id !== localUserId)
              .map((member) =>
                RTMClient.sendMessageToPeer(
                  {
                    text: `${PeerMessage.ChannelUpdated}__${channelId}`,
                  },
                  member._id,
                ),
              ),
          );
        }

        alert.success("Channel privacy was updated successfully");
        onClose();
      } catch (err) {
        alert.error("Could not update channel privacy. Please try again");
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
