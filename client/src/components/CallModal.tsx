import { BiPhone, BiPhoneOff } from "react-icons/bi";

import BaseModal from "./BaseModal";
import RTCControlButton from "./RTCControlButton";
import CallDirection from "../types/CallDirection";

interface CallModalProps {
  callDirection: CallDirection;
  contactName: string;
  onDeclineBtnClick?: () => void;
  onAcceptBtnClick?: () => void;
  onRecallBtnClick?: () => void;
}

const CallModal = ({
  callDirection,
  contactName,
  onDeclineBtnClick,
  onAcceptBtnClick,
  onRecallBtnClick,
}: CallModalProps) => (
  <BaseModal>
    <div className="flex max-h-full w-full flex-col items-center gap-8 rounded bg-black p-4 shadow-lg shadow-primary-600 sm:w-1/2 xl:w-1/3 xl:p-6">
      <div className="flex h-32 w-32 cursor-default items-center justify-center rounded-full bg-primary text-5xl text-white">
        {contactName.slice(0, 2).toUpperCase()}
      </div>

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
