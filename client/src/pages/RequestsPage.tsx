import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

import RequestItem from "../components/RequestItem";
import useDocumentTitle from "../hooks/useDocumentTitle";

const RequestsPage = () => {
  useDocumentTitle("Inbox/Outbox requests");

  return (
    <div className="flex h-full w-full flex-col justify-center gap-12">
      <h1 className="text-center text-2xl font-bold text-white sm:text-3xl xl:text-4xl">
        Inbox/Outbox requests
      </h1>

      <Tabs>
        <TabList>
          <Tab>Inbox</Tab>
          <Tab>Outbox</Tab>
        </TabList>

        <TabPanel>
          <div className="flex flex-col gap-2">
            <RequestItem type="contactship" context="inbox" username="User" />
            <RequestItem
              type="invite"
              context="inbox"
              username="User"
              channelName="Channel"
            />
            <RequestItem
              type="join"
              context="inbox"
              username="User"
              channelName="Channel"
            />
          </div>
        </TabPanel>
        <TabPanel>
          <div className="flex flex-col gap-2">
            <RequestItem type="contactship" context="outbox" username="User" />
            <RequestItem
              type="invite"
              context="outbox"
              username="User"
              channelName="Channel"
            />
            <RequestItem type="join" context="outbox" username="Channel" />
            <RequestItem
              type="contactship"
              context="outbox"
              username="username"
            />
            <RequestItem
              type="invite"
              context="outbox"
              username="username"
              channelName="channel"
            />
            <RequestItem type="join" context="outbox" username="channel" />
            <RequestItem
              type="contactship"
              context="outbox"
              username="username"
            />
            <RequestItem
              type="invite"
              context="outbox"
              username="username"
              channelName="channel"
            />
            <RequestItem type="join" context="outbox" username="channel" />
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default RequestsPage;
