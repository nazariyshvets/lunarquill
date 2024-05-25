import { Link } from "react-router-dom";
import { useAlert } from "react-alert";
import { BiCopy, BiUserPlus, BiGroup, BiBell, BiExit } from "react-icons/bi";

import SimpleButton, { SimpleButtonProps } from "../components/SimpleButton";
import { logout } from "../redux/authSlice";
import { useGetUserDetailsQuery } from "../services/mainService";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAppDispatch from "../hooks/useAppDispatch";

const ProfilePage = () => {
  const { data: userDetails } = useGetUserDetailsQuery({});
  const dispatch = useAppDispatch();
  const alert = useAlert();

  useDocumentTitle("Profile");

  const handleCopyIdToClipboard = async () => {
    const userId = userDetails?._id;

    if (userId) {
      try {
        await navigator.clipboard.writeText(userId);
        alert.success("The id is copied successfully");
      } catch (err) {
        alert.error("Could not copy the id. Please try again");
        console.log(err);
      }
    }
  };

  const username = userDetails?.username ?? "You";

  return (
    <div className="flex h-full w-full flex-col items-center gap-4">
      <div className="flex h-full w-full flex-col justify-center gap-8">
        <div className="flex flex-col gap-2">
          <div className="relative flex justify-center">
            <div className="flex h-32 w-32 cursor-default items-center justify-center rounded-full bg-primary text-5xl text-white">
              {username.slice(0, 2).toUpperCase()}
            </div>
            <div
              className="absolute bottom-0 right-0 flex cursor-pointer items-center gap-1 p-2 text-sm text-lightgrey hover:text-primary-light"
              onClick={handleCopyIdToClipboard}
            >
              <BiCopy />
              Copy id
            </div>
          </div>
          <span className="truncate text-center text-lg font-medium text-primary">
            {username}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <Link to="/add-contact">
            <ActionButton>
              <BiUserPlus />
              Add a contact
            </ActionButton>
          </Link>
          <Link to="/add-channel">
            <ActionButton>
              <BiGroup />
              Join/Create a channel
            </ActionButton>
          </Link>
          <Link to="/requests">
            <ActionButton>
              <BiBell />
              Inbox/Outbox requests
            </ActionButton>
          </Link>
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
