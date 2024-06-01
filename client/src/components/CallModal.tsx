import { createPortal } from "react-dom";

import { BiPhone, BiPhoneOff } from "react-icons/bi";

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
}: CallModalProps) =>
  createPortal(
    <div className="fixed bottom-0 left-0 right-0 top-0 z-[9000] flex items-center justify-center bg-deep-black bg-opacity-70 p-4">
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
    </div>,
    document.body,
  );

export default CallModal;
