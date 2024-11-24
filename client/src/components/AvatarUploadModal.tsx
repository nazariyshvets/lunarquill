import Modal from "./Modal";
import SelectableItem from "./SelectableItem";
import FileUploader from "./FileUploader";
import NoDataBox from "./NoDataBox";
import { IMAGES_IN_STORAGE_LIMIT } from "../constants/constants";
import { Avatar } from "../types/Avatar";

interface AvatarUploadModalProps {
  avatars: Avatar[];
  selectedAvatarId: string | undefined;
  onAvatarSelect: (avatarId: string) => void;
  onAvatarRemove: (avatar: Avatar) => void;
  onAvatarUpload: (sources: File[]) => void;
  onCancel: () => void;
  onSave: () => void;
}

const AvatarUploadModal = ({
  avatars,
  selectedAvatarId,
  onAvatarSelect,
  onAvatarRemove,
  onAvatarUpload,
  onCancel,
  onSave,
}: AvatarUploadModalProps) => {
  const selectableAvatars = avatars.map((avatar) => (
    <SelectableItem
      key={avatar.id}
      isSelected={avatar.id === selectedAvatarId}
      onSelect={() => onAvatarSelect(avatar.id)}
      onRemove={() => onAvatarRemove(avatar)}
    >
      <img
        src={avatar.dataUrl}
        alt={avatar.name}
        className="h-full w-full rounded object-cover"
      />
    </SelectableItem>
  ));

  return (
    <Modal title="Edit avatar" onCancel={onCancel} onSave={onSave}>
      <div className="flex w-full flex-col gap-1 pb-7">
        {Boolean(selectableAvatars.length) && (
          <>
            <div className="flex gap-2 overflow-auto p-1">
              {selectableAvatars}
            </div>

            <div className="flex items-center gap-2">
              <span className="h-px w-full bg-white" />
              <span className="text-white">or</span>
              <span className="h-px w-full bg-white" />
            </div>
          </>
        )}

        {avatars.length < IMAGES_IN_STORAGE_LIMIT ? (
          <FileUploader
            type="image"
            multiple={false}
            onDropAccepted={onAvatarUpload}
          />
        ) : (
          <NoDataBox
            text={`You can have up to ${IMAGES_IN_STORAGE_LIMIT} avatars`}
          />
        )}
      </div>
    </Modal>
  );
};

export default AvatarUploadModal;
