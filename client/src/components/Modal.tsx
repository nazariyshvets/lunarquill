import { PropsWithChildren } from "react";
import { createPortal } from "react-dom";

import Button from "./Button";

interface ModalProps {
  title: string;
  onCancel: () => void;
  onSave: () => void;
}

const Modal = ({
  title,
  children,
  onCancel,
  onSave,
}: PropsWithChildren<ModalProps>) =>
  createPortal(
    <div className="fixed bottom-0 left-0 right-0 top-0 z-[9000] flex items-center justify-center bg-deep-black bg-opacity-70 p-4">
      <div className="flex max-h-full w-full flex-col gap-8 rounded bg-black p-4 shadow-lg shadow-primary-600 sm:w-1/2 xl:w-1/3 xl:p-6">
        <h1 className="flex-shrink-0 truncate text-xl font-bold text-lightgrey sm:text-2xl">
          {title}
        </h1>

        <div className="overflow-auto">{children}</div>

        <div className="flex gap-2 self-end">
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={onSave}>Save</Button>
        </div>
      </div>
    </div>,
    document.body,
  );

export default Modal;
