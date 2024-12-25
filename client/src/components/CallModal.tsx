import { BiPhone, BiPhoneOff } from "react-icons/bi";

import Contact from "./Contact";
import BaseModal from "./BaseModal";
import RTCControlButton from "./RTCControlButton";
import CallDirection from "../types/CallDirection";
import { UserWithoutPassword } from "../types/User";

interface CallModalProps {
  callDirection: CallDirection;
  contact: UserWithoutPassword;
  onDeclineBtnClick?: () => void;
  onAcceptBtnClick?: () => void;
  onRecallBtnClick?: () => void;
}

const CallModal = ({
  callDirection,
  contact,
  onDeclineBtnClick,
  onAcceptBtnClick,
  onRecallBtnClick,
}: CallModalProps) => (
  <BaseModal>
    <div className="flex max-h-full w-full flex-col items-center gap-8 rounded bg-black p-4 shadow-lg shadow-primary-600 sm:w-1/2 xl:w-1/3 xl:p-6">
      <Contact
        name={contact.username}
        isOnline={false}
        avatarId={contact.selectedAvatar}
        size="xl"
        layout="vertical"
      />

      {callDirection === CallDirection.Outgoing ? (
        <RTCControlButton onClick={onRecallBtnClick}>
          <BiPhoneOff className="h-full w-full text-danger" />
        </RTCControlButton>
      ) : (
        <div className="flex items-center justify-center gap-4">
          <RTCControlButton onClick={onDeclineBtnClick}>
            <BiPhoneOff className="h-full w-full text-danger" />
          </RTCControlButton>
          <RTCControlButton onClick={onAcceptBtnClick}>
            <BiPhone className="h-full w-full text-primary" />
          </RTCControlButton>
        </div>
      )}
    </div>
  </BaseModal>
);

export default CallModal;
