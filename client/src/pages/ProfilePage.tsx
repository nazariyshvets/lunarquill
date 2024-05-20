import { BiCopy, BiUserPlus, BiGroup, BiBell, BiExit } from "react-icons/bi";

import SimpleButton, { SimpleButtonProps } from "../components/SimpleButton";
import { logout } from "../redux/authSlice";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAppDispatch from "../hooks/useAppDispatch";

const ProfilePage = () => {
  const dispatch = useAppDispatch();

  useDocumentTitle("Profile");

  return (
    <div className="flex h-full w-full flex-col items-center gap-4">
      <div className="flex h-full w-full flex-col justify-center gap-8">
        <div className="flex flex-col gap-2">
          <div className="relative flex justify-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary text-5xl text-white">
              NS
            </div>
            <div className="absolute bottom-0 right-0 flex cursor-pointer items-center gap-1 p-2 text-sm text-lightgrey hover:text-primary-light">
              <BiCopy />
              Copy id
            </div>
          </div>
          <span className="truncate text-center text-lg font-medium text-primary">
            username
          </span>
        </div>

        <div className="flex flex-col items-center">
          <ActionButton>
            <BiUserPlus />
            Add a contact
          </ActionButton>
          <ActionButton>
            <BiGroup />
            Join/Create a channel
          </ActionButton>
          <ActionButton>
            <BiBell />
            Inbox/Outbox requests
          </ActionButton>
        </div>
      </div>

      <ActionButton isDanger onClick={() => dispatch(logout())}>
        <BiExit />
        Log out
      </ActionButton>
    </div>
  );
};

const ActionButton = ({
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

export default ProfilePage;
