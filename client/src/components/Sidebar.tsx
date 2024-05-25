import { Link } from "react-router-dom";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { BiX, BiUserPlus, BiGroup, BiBell } from "react-icons/bi";

import SimpleButton from "./SimpleButton";
import Contact from "./Contact";
import NoDataBox from "./NoDataBox";
import type { IUserWithoutPassword } from "../../../server/src/models/User";
import type { IChannel } from "../../../server/src/models/Channel";

interface SidebarProps {
  username: string;
  inboxRequestsCount: number;
  contacts: IUserWithoutPassword[];
  channels: IChannel[];
  onClose?: () => void;
}

const Sidebar = ({
  username,
  inboxRequestsCount,
  contacts,
  channels,
  onClose,
}: SidebarProps) => (
  <aside className="flex h-full max-h-full w-full max-w-full flex-col gap-6 bg-deep-black">
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2">
        <Link to="/profile" className="max-w-full overflow-hidden">
          <Contact name={username} isOnline={true} size="lg" />
        </Link>
        <SimpleButton className="xl:hidden" onClick={onClose}>
          <BiX className="text-2xl" />
        </SimpleButton>
      </div>

      <div className="flex items-center gap-1 text-2xl">
        <Link to="/add-contact">
          <SimpleButton>
            <BiUserPlus />
          </SimpleButton>
        </Link>
        <Link to="/add-channel">
          <SimpleButton>
            <BiGroup />
          </SimpleButton>
        </Link>
        <Link to="/requests">
          <div className="relative flex">
            <SimpleButton>
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
        {contacts && contacts.length > 0 ? (
          <div className="flex flex-col gap-2">
            {contacts
              .sort((a, b) => (b.isOnline ? 1 : -1) - (a.isOnline ? 1 : -1))
              .map((contact) => (
                <Contact
                  key={contact._id}
                  name={contact.username}
                  isOnline={contact.isOnline}
                />
              ))}
          </div>
        ) : (
          <NoDataBox text="No contacts" />
        )}
      </TabPanel>
      <TabPanel>
        {channels && channels.length > 0 ? (
          <div className="flex flex-col gap-2">
            {channels.map((channel) => (
              <Contact key={channel._id} name={channel.name} isOnline={false} />
            ))}
          </div>
        ) : (
          <NoDataBox text="No channels" />
        )}
      </TabPanel>
    </Tabs>
  </aside>
);

export default Sidebar;
