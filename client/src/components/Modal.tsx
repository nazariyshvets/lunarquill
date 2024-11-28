import { useState, PropsWithChildren } from "react";

import BaseModal from "./BaseModal";
import Button from "./Button";
import useClickOutside from "../hooks/useClickOutside";

interface ModalProps {
  title: string;
  displayButtons?: boolean;
  cancelBtnText?: string;
  saveBtnText?: string;
  onCancel: () => void;
  onSave: () => void;
}

const Modal = ({
  title,
  displayButtons = true,
  cancelBtnText = "Cancel",
  saveBtnText = "Save",
  children,
  onCancel,
  onSave,
}: PropsWithChildren<ModalProps>) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useClickOutside({
    element: container || undefined,
    onClickOutside: onCancel,
  });

  return (
    <BaseModal>
      <div
        ref={setContainer}
        className="flex max-h-screen w-full flex-col gap-8 rounded bg-black p-4 shadow-lg shadow-primary-600 sm:w-1/2 xl:w-1/3 xl:p-6"
      >
        <h1 className="flex-shrink-0 truncate text-xl font-bold text-lightgrey sm:text-2xl">
          {title}
        </h1>

        <div className="overflow-auto">{children}</div>

        {displayButtons && (
          <div className="flex gap-2 self-end">
            <Button onClick={onCancel}>{cancelBtnText}</Button>
            <Button onClick={onSave}>{saveBtnText}</Button>
          </div>
        )}
      </div>
    </BaseModal>
  );
};

export default Modal;
