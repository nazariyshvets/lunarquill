import { IconType } from "react-icons";

import SimpleButton from "./SimpleButton";

interface RequestItemActionButtonProps {
  label: string;
  icon: IconType;
  isPositiveAction?: boolean;
  onClick?: () => void;
}

const RequestItemActionButton = ({
  label,
  icon: Icon,
  isPositiveAction = true,
  onClick,
}: RequestItemActionButtonProps) => (
  <SimpleButton
    className="flex items-center gap-1 text-sm"
    isDanger={!isPositiveAction}
    onClick={onClick}
  >
    <Icon /> {label}
  </SimpleButton>
);

export default RequestItemActionButton;
