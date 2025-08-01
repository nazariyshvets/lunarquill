import { Link } from "react-router-dom";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { BiX, BiUserPlus, BiGroup, BiBell } from "react-icons/bi";

import SimpleButton from "./SimpleButton";
import Contact from "./Contact";
import NoDataBox from "./NoDataBox";
import useIsUserOnline from "../hooks/useIsUserOnline";
import type { UserWithoutPassword } from "../types/User";
import type { Channel } from "../types/Channel";

interface SidebarProps {
  user?: UserWithoutPassword;
  inboxRequestsCount: number;
  contacts: UserWithoutPassword[];
  channels: Channel[];
  onClose?: () => void;
}

const Sidebar = ({
  user,
  inboxRequestsCount,
  contacts,
  channels,
  onClose,
}: SidebarProps) => {
  const isUserOnline = useIsUserOnline();

  return (
    <aside className="flex h-full max-h-full w-full max-w-full flex-col gap-6 bg-deep-black">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2">
          <Link to="/profile" className="max-w-full overflow-hidden">
            <Contact
              name={user?.username ?? "You"}
              isOnline={isUserOnline(user?._id)}
              avatarId={user?.selectedAvatar}
              size="lg"
              onClick={onClose}
            />
          </Link>
          <SimpleButton className="xl:hidden" onClick={onClose}>
            <BiX className="text-2xl" />
          </SimpleButton>
        </div>

        <div className="flex items-center gap-1 text-2xl">
          <Link to="/add-contact">
            <SimpleButton onClick={onClose}>
              <BiUserPlus />
            </SimpleButton>
          </Link>
          <Link to="/add-channel">
            <SimpleButton onClick={onClose}>
              <BiGroup />
            </SimpleButton>
          </Link>
          <Link to="/requests">
            <div className="relative flex">
              <SimpleButton onClick={onClose}>
                <BiBell />
              </SimpleButton>
              {Boolean(inboxRequestsCount) && (
                <span className="absolute left-8 top-0 text-sm font-medium text-primary-light">
                  {inboxRequestsCount}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>

      <Tabs>
        <TabList>
          <Tab>Contacts</Tab>
          <Tab>Channels</Tab>
        </TabList>

        <TabPanel>
          {contacts?.length ? (
            <div className="flex flex-col gap-2">
              {[...contacts]
                .sort(
                  (a, b) =>
                    (isUserOnline(b._id) ? 1 : -1) -
                    (isUserOnline(a._id) ? 1 : -1),
                )
                .map((contact) => (
                  <Link key={contact._id} to={`/contacts/${contact._id}/chat`}>
                    <Contact
                      name={contact.username}
                      isOnline={isUserOnline(contact._id)}
                      avatarId={contact.selectedAvatar}
                      onClick={onClose}
                    />
                  </Link>
                ))}
            </div>
          ) : (
            <NoDataBox text="No contacts" />
          )}
        </TabPanel>
        <TabPanel>
          {channels?.length ? (
            <div className="flex flex-col gap-2">
              {channels.map((channel) => (
                <Link key={channel._id} to={`/channels/${channel._id}/chat`}>
                  <Contact
                    name={channel.name}
                    isOnline={false}
                    avatarId={channel.selectedAvatar}
                    onClick={onClose}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <NoDataBox text="No channels" />
          )}
        </TabPanel>
      </Tabs>
    </aside>
  );
};

export default Sidebar;
