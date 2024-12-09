import React, { PropsWithChildren } from "react";

import Placement from "../types/Placement";
import { DROPDOWN_PLACEMENT_TO_STYLES_MAP } from "../constants/constants";

interface DropdownProps {
  isOpen: boolean;
  content: React.ReactNode;
  placement: Placement;
}

const Dropdown = ({
  isOpen,
  placement,
  content,
  children,
}: PropsWithChildren<DropdownProps>) => (
  <div className="relative">
    {children}
    {isOpen && (
      <div
        className={`pointer-events-none absolute z-[200] flex w-[288px] sm:w-[400px] ${DROPDOWN_PLACEMENT_TO_STYLES_MAP[placement]}`}
      >
        <div className="pointer-events-auto w-fit max-w-[288px] rounded bg-deep-black p-4 shadow-button sm:max-w-[400px]">
          {content}
        </div>
      </div>
    )}
  </div>
);

export default Dropdown;
