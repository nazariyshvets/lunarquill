import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { BiX, BiUserPlus, BiGroup, BiBell } from "react-icons/bi";

import SimpleButton from "./SimpleButton";
import Contact from "./Contact";

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => (
  <aside className="flex h-full max-h-full w-full max-w-full flex-col gap-6 bg-deep-black">
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2">
        <Contact
          name="UsernameUsernameUsernameUsernameUsernameUsernameUsername"
          isOnline={false}
          size="lg"
        />
        <SimpleButton className="xl:hidden" onClick={onClose}>
          <BiX className="text-2xl" />
        </SimpleButton>
      </div>

      <div className="flex items-center gap-1 text-2xl">
        <SimpleButton>
          <BiUserPlus />
        </SimpleButton>
        <SimpleButton>
          <BiGroup />
        </SimpleButton>
        <SimpleButton>
          <BiBell />
        </SimpleButton>
      </div>
    </div>

    <Tabs>
      <TabList>
        <Tab>Contacts</Tab>
        <Tab>Channels</Tab>
      </TabList>

      <TabPanel>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 25 }).map((_, i) => (
            <Contact
              key={i}
              name="Usernamesernamesernamesernamesernamesername"
              isOnline={i % 2 === 0}
            />
          ))}
        </div>
      </TabPanel>
      <TabPanel>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Contact key={i} name="channel" isOnline={false} />
          ))}
        </div>
      </TabPanel>
    </Tabs>
  </aside>
);

export default Sidebar;
