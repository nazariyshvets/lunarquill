import { useState } from "react";

import { Outlet } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";

import { BiMenu } from "react-icons/bi";

import Sidebar from "./Sidebar";
import SimpleButton from "./SimpleButton";
import {
  useGetUserByIdQuery,
  useGetUserContactsQuery,
  useGetUserChannelsQuery,
  useGetUserRequestsQuery,
} from "../services/userApi";
import useAuth from "../hooks/useAuth";

const SidebarLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { userId } = useAuth();
  const { data: userDetails } = useGetUserByIdQuery(userId ?? skipToken);
  const { data: requests = [] } = useGetUserRequestsQuery(userId ?? skipToken);
  const { data: contacts = [] } = useGetUserContactsQuery(userId ?? skipToken);
  const { data: channels = [] } = useGetUserChannelsQuery(userId ?? skipToken);

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
        } xl:static xl:block xl:w-1/5 xl:overflow-hidden xl:p-0`}
      >
        <Sidebar
          user={userDetails}
          inboxRequestsCount={
            requests.filter((request) => request.to._id === userId).length
          }
          contacts={contacts}
          channels={channels}
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
