import { PropsWithChildren } from "react";
import { createPortal } from "react-dom";

const BaseModal = ({ children }: PropsWithChildren<Record<never, never>>) =>
  createPortal(
    <div className="fixed bottom-0 left-0 right-0 top-0 z-[9000] flex items-center justify-center bg-deep-black bg-opacity-70 p-4">
      {children}
    </div>,
    document.body,
  );

export default BaseModal;
