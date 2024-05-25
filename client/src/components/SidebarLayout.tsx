import { useState } from "react";
import { Outlet } from "react-router-dom";

import { BiMenu } from "react-icons/bi";

import Sidebar from "./Sidebar";
import SimpleButton from "./SimpleButton";
import {
  useGetUserDetailsQuery,
  useGetUserRequestsQuery,
  useGetUserContactsQuery,
  useGetUserChannelsQuery,
} from "../services/mainService";
import RTCConfig from "../config/RTCConfig";

const SidebarLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  const userId = RTCConfig.uid.toString();
  const { data: userDetails } = useGetUserDetailsQuery({});
  const { data: requests } = useGetUserRequestsQuery(userId);
  const { data: contacts } = useGetUserContactsQuery(userId);
  const { data: channels } = useGetUserChannelsQuery(userId);

  return (
    <div className="relative flex h-screen max-h-screen min-h-screen flex-col gap-2 bg-deep-black p-4 xl:flex-row">
      <SimpleButton
        className={`self-start ${isOpen ? "hidden" : "inline-block"} xl:hidden`}
        onClick={() => setIsOpen(true)}
      >
        <BiMenu className="text-2xl" />
      </SimpleButton>
      <div
        className={`absolute left-0 top-0 z-10 h-full max-h-full w-full p-4 ${
          isOpen ? "block" : "hidden"
        } xl:static xl:block xl:w-1/5 xl:p-0`}
      >
        <Sidebar
          username={userDetails?.username ?? "You"}
          inboxRequestsCount={
            requests?.filter((request) => request.to._id === userId).length ?? 0
          }
          contacts={contacts ?? []}
          channels={channels ?? []}
          onClose={() => setIsOpen(false)}
        />
      </div>

      <div className="h-full max-h-full w-full overflow-hidden sm:px-10 xl:px-20">
        <Outlet />
      </div>
    </div>
  );
};

export default SidebarLayout;
