import { useState } from "react";

import { SubmitHandler } from "react-hook-form";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { useAlert } from "react-alert";
import { skipToken } from "@reduxjs/toolkit/query";

import SimpleButton from "../components/SimpleButton";
import Contact from "../components/Contact";
import ContactAdditionForm from "../components/ContactAdditionForm";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAuth from "../hooks/useAuth";
import useRTMClient from "../hooks/useRTMClient";
import useChatConnection from "../hooks/useChatConnection";
import {
  useGetUserChannelsQuery,
  useCreateChannelMutation,
  useSearchChannelsMutation,
  useJoinChannelMutation,
  useCreateRequestMutation,
  useFetchChannelByIdMutation,
  useCreateWhiteboardRoomMutation,
  useFetchWhiteboardSdkTokenMutation,
} from "../services/mainService";
import getErrorMessage from "../utils/getErrorMessage";
import { RequestTypeEnum } from "../types/Request";
import type { Channel } from "../types/Channel";
import PeerMessage from "../types/PeerMessage";

const ChannelAdditionPage = () => {
  const { userId } = useAuth();

  const [searchedChannels, setSearchedChannels] = useState<Channel[]>([]);

  const { data: userChannels } = useGetUserChannelsQuery(userId ?? skipToken);
  const [createChannel] = useCreateChannelMutation();
  const [searchChannels] = useSearchChannelsMutation();
  const [joinChannel] = useJoinChannelMutation();
  const [createRequest] = useCreateRequestMutation();
  const [fetchChannel] = useFetchChannelByIdMutation();
  const [createWhiteboardRoom] = useCreateWhiteboardRoomMutation();
  const [fetchWhiteboardSdkToken] = useFetchWhiteboardSdkTokenMutation();
  const RTMClient = useRTMClient();
  const chatConnection = useChatConnection();
  const alert = useAlert();

  useDocumentTitle("Join/Create a channel");

  const handlePublicSearchFormSubmit: SubmitHandler<{
    publicSearchValue: string;
  }> = async ({ publicSearchValue }) => {
    try {
      const response = await searchChannels(publicSearchValue).unwrap();

      if (response.length === 0) alert.info("No channels found");

      setSearchedChannels(response);
    } catch (err) {
      throw new Error(
        getErrorMessage({
          error: err,
          defaultErrorMessage:
            "Could not search for channels. Please try again",
        }),
      );
    }
  };

  const handlePrivateJoiningFormSubmit: SubmitHandler<{
    privateSearchValue: string;
  }> = async ({ privateSearchValue }) => {
    if (!userId) return;

    try {
      const channel = await fetchChannel(privateSearchValue).unwrap();

      await Promise.all([
        createRequest({
          from: userId,
          to: null,
          type: RequestTypeEnum.Join,
          channel: channel._id,
        }).unwrap(),
        chatConnection.joinGroup({
          groupId: channel.chatTargetId,
          message: "",
        }),
      ]);
      await RTMClient.sendMessageToPeer(
        { text: PeerMessage.RequestCreated },
        channel.admin.toString(),
      );
      alert.success("Request created successfully!");
    } catch (err) {
      throw new Error(
        getErrorMessage({
          error: err,
          defaultErrorMessage:
            "Could not send a joining request. Please try again",
        }),
      );
    }
  };

  const handleCreationFormSubmit: SubmitHandler<{
    channelName: string;
    isPrivate: boolean;
  }> = async (data) => {
    if (!userId) return;

    try {
      const { token: whiteboardSdkToken } =
        await fetchWhiteboardSdkToken().unwrap();
      const whiteboardRoomCreationResponse = await createWhiteboardRoom({
        sdkToken: whiteboardSdkToken,
      }).unwrap();
      const whiteboardRoomId = JSON.parse(whiteboardRoomCreationResponse).uuid;
      const { data: chatData } = await chatConnection.createGroup({
        data: {
          groupname: data.channelName,
          desc: "",
          members: [userId],
          public: !data.isPrivate,
          approval: data.isPrivate,
          allowinvites: true,
          inviteNeedConfirm: true,
          maxusers: 100,
        },
      });

      if (whiteboardRoomId && chatData?.groupid) {
        await createChannel({
          name: data.channelName,
          admin: userId,
          participants: [userId],
          chatTargetId: chatData.groupid,
          whiteboardRoomId,
          isPrivate: data.isPrivate,
        }).unwrap();
        alert.success("Channel created successfully!");
      }
    } catch (err) {
      throw new Error(
        getErrorMessage({
          error: err,
          defaultErrorMessage: "Could not create a channel. Please try again",
        }),
      );
    }
  };

  const handleJoinChannel = async (channelId: string) => {
    if (!userId) return;

    try {
      const channel = await fetchChannel(channelId).unwrap();

      await Promise.all([
        joinChannel({ userId, channelId }).unwrap(),
        chatConnection.joinGroup({
          groupId: channel.chatTargetId,
          message: "",
        }),
      ]);
      alert.success("You joined the channel successfully");
    } catch (err) {
      alert.error(
        getErrorMessage({
          error: err,
          defaultErrorMessage: "Could not join a channel. Please try again",
        }),
      );
      console.error("Error joining a channel:", err);
    }
  };

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
              <div className="flex flex-col gap-6">
                <ContactAdditionForm
                  submitBtnText="Search"
                  inputField={{
                    name: "publicSearchValue",
                    placeholder: "Enter name or id of the channel...",
                    required: true,
                  }}
                  onSubmit={handlePublicSearchFormSubmit}
                />

                {searchedChannels.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {searchedChannels.map((channel) => (
                      <div
                        key={channel._id}
                        className="flex items-center justify-between gap-2"
                      >
                        <Contact name={channel.name} isOnline={false} />

                        {userChannels?.find(
                          (userChannel) => userChannel._id === channel._id,
                        ) ? (
                          <span className="p-2 text-lightgrey">Joined</span>
                        ) : (
                          <SimpleButton
                            onClick={() => handleJoinChannel(channel._id)}
                          >
                            Join
                          </SimpleButton>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabPanel>

            <TabPanel>
              <ContactAdditionForm
                submitBtnText="Join"
                inputField={{
                  name: "privateSearchValue",
                  placeholder: "Enter id of the channel...",
                  required: true,
                }}
                onSubmit={handlePrivateJoiningFormSubmit}
              />
            </TabPanel>
          </Tabs>
        </TabPanel>
        <TabPanel>
          <ContactAdditionForm
            submitBtnText="Create"
            inputField={{
              name: "channelName",
              placeholder: "Enter a name for a channel...",
              required: true,
            }}
            checkboxField={{
              name: "isPrivate",
              label: "Private",
            }}
            onSubmit={handleCreationFormSubmit}
          />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default ChannelAdditionPage;
