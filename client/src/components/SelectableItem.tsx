import { PropsWithChildren } from "react";

import { BiTrash } from "react-icons/bi";

import stopEventPropagation from "../utils/stopEventPropagation";

interface SelectableItemProps {
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

const SelectableItem = ({
  isSelected,
  children,
  onSelect,
  onRemove,
}: PropsWithChildren<SelectableItemProps>) => (
  <div
    className={`relative h-24 w-24 flex-shrink-0 cursor-pointer rounded sm:h-28 sm:w-28 ${
      isSelected ? "outline outline-2 outline-offset-2 outline-primary" : ""
    }`}
    onClick={stopEventPropagation(onSelect)}
  >
    {children}
    <button
      className="absolute right-1 top-2 h-5 w-5 text-white transition-colors hover:text-primary sm:h-6 sm:w-6"
      onClick={stopEventPropagation(onRemove)}
    >
      <BiTrash className="h-full w-full" />
    </button>
  </div>
);

export default SelectableItem;
