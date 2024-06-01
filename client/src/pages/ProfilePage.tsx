import { Link } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { debounce } from "lodash";
import { useAlert } from "react-alert";
import { BiBell, BiCopy, BiExit, BiGroup, BiUserPlus } from "react-icons/bi";

import SimpleButton, { SimpleButtonProps } from "../components/SimpleButton";
import Switch from "../components/Switch";
import { logout } from "../redux/authSlice";
import {
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
  useFetchUserContactsMutation,
} from "../services/mainService";
import useAuth from "../hooks/useAuth";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAppDispatch from "../hooks/useAppDispatch";
import useRTMClient from "../hooks/useRTMClient";
import useCopyToClipboard from "../hooks/useCopyToClipboard";
import getErrorMessage from "../utils/getErrorMessage";
import PeerMessage from "../types/PeerMessage";

const ProfilePage = () => {
  const { userId } = useAuth();
  const { data: userDetails } = useGetUserByIdQuery(userId ?? skipToken);
  const [updateUser] = useUpdateUserByIdMutation();
  const [fetchUserContacts] = useFetchUserContactsMutation();
  const RTMClient = useRTMClient();
  const dispatch = useAppDispatch();
  const copyToClipboard = useCopyToClipboard();
  const alert = useAlert();

  useDocumentTitle("Profile");

  const handleCopyIdToClipboard = () => userId && copyToClipboard(userId, "id");

  const handleOnlineStatusChange = debounce(async (isOnline: boolean) => {
    if (userId) {
      try {
        const updatedUser = await updateUser({
          userId,
          updateData: { isOnline },
        }).unwrap();
        const contacts = await fetchUserContacts(userId).unwrap();

        const onlineStatus = updatedUser.isOnline
          ? PeerMessage.UserWentOnline
          : PeerMessage.UserWentOffline;

        contacts.forEach((contact) =>
          RTMClient.sendMessageToPeer(
            {
              text: onlineStatus,
            },
            contact._id,
          ),
        );
      } catch (error) {
        alert.error(
          getErrorMessage({
            error,
            defaultErrorMessage:
              "Could not set online status. Please try again",
          }),
        );
        console.log(error);
      }
    }
  }, 200);

  const username = userDetails?.username ?? "You";

  return (
    <div className="flex h-full w-full flex-col items-center gap-4">
      <div className="flex h-full w-full flex-col justify-center gap-8">
        <div className="flex flex-col gap-2">
          <div className="relative flex justify-center">
            <div className="flex h-32 w-32 cursor-default items-center justify-center rounded-full bg-primary text-5xl text-white">
              {username.slice(0, 2).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 flex flex-col items-end gap-8 p-2">
              <div
                className="flex cursor-pointer items-center gap-1 text-sm text-lightgrey hover:text-primary-light"
                onClick={handleCopyIdToClipboard}
              >
                <BiCopy />
                Copy id
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={userDetails?.isOnline ?? false}
                  onChange={handleOnlineStatusChange}
                />
                <span className="text-white">Online</span>
              </div>
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
