import SimpleButton, { SimpleButtonProps } from "./SimpleButton";

const ProfilePageActionButton = ({
  isDanger = false,
  children,
  onClick,
}: SimpleButtonProps) => (
  <SimpleButton
    isDanger={isDanger}
    className="flex items-center gap-1 text-lg"
    onClick={onClick}
  >
    {children}
  </SimpleButton>
);

export default ProfilePageActionButton;
