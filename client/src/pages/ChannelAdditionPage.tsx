import { SubmitHandler } from "react-hook-form";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

import SimpleButton from "../components/SimpleButton";
import Contact from "../components/Contact";
import ContactAdditionForm from "../components/ContactAdditionForm";
import useDocumentTitle from "../hooks/useDocumentTitle";

const ChannelAdditionPage = () => {
  useDocumentTitle("Join/Create a channel");

  const handlePublicSearchFormSubmit: SubmitHandler<{
    publicSearchValue: string;
  }> = (data) => console.log("submit public search form with data:", data);

  const handlePrivateJoiningFormSubmit: SubmitHandler<{
    privateSearchValue: string;
  }> = (data) => console.log("submit private joining with data:", data);
  const handleCreationFormSubmit: SubmitHandler<{
    channelName: string;
  }> = (data) => console.log("submit creation form with data:", data);

  return (
    <div className="flex h-full max-h-full w-full flex-col justify-center gap-12">
      <h1 className="text-center text-2xl font-bold text-white sm:text-3xl xl:text-4xl">
        Join/Create a channel
      </h1>

      <Tabs>
        <TabList>
          <Tab>Join</Tab>
          <Tab>Create</Tab>
        </TabList>

        <TabPanel>
          <Tabs>
            <TabList>
              <Tab>Public</Tab>
              <Tab>Private</Tab>
            </TabList>

            <TabPanel>
              <div className="flex flex-col gap-2">
                <ContactAdditionForm
                  submitBtnText="Search"
                  onSubmit={handlePublicSearchFormSubmit}
                  formField={{
                    name: "publicSearchValue",
                    placeholder: "Enter name or id of the channel...",
                    required: true,
                  }}
                />

                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2"
                  >
                    <Contact name="channel" isOnline={false} />
                    <SimpleButton>Join</SimpleButton>
                  </div>
                ))}
              </div>
            </TabPanel>

            <TabPanel>
              <ContactAdditionForm
                submitBtnText="Join"
                onSubmit={handlePrivateJoiningFormSubmit}
                formField={{
                  name: "privateSearchValue",
                  placeholder: "Enter id of the channel...",
                  required: true,
                }}
              />
            </TabPanel>
          </Tabs>
        </TabPanel>
        <TabPanel>
          <ContactAdditionForm
            submitBtnText="Create"
            onSubmit={handleCreationFormSubmit}
            formField={{
              name: "channelName",
              placeholder: "Enter a name for a channel...",
              required: true,
            }}
          />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default ChannelAdditionPage;
