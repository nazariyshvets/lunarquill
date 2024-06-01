import { useState } from "react";

import { SubmitHandler } from "react-hook-form";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { useAlert } from "react-alert";

import SimpleButton from "../components/SimpleButton";
import Contact from "../components/Contact";
import ContactAdditionForm from "../components/ContactAdditionForm";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAuth from "../hooks/useAuth";
import useAuthRequestConfig from "../hooks/useAuthRequestConfig";
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
} from "../services/mainService";
import fetchWhiteboardSdkToken from "../utils/fetchWhiteboardSdkToken";
import getErrorMessage from "../utils/getErrorMessage";
import { RequestTypeEnum } from "../types/Request";
import type { IChannel } from "../../../server/src/models/Channel";
import PeerMessage from "../types/PeerMessage";

const ChannelAdditionPage = () => {
  const { userId } = useAuth();

  const [searchedChannels, setSearchedChannels] = useState<IChannel[]>([]);

  const { data: userChannels } = useGetUserChannelsQuery(userId ?? "");
  const [createChannel] = useCreateChannelMutation();
  const [searchChannels] = useSearchChannelsMutation();
  const [joinChannel] = useJoinChannelMutation();
  const [createRequest] = useCreateRequestMutation();
  const [fetchChannel] = useFetchChannelByIdMutation();
  const [createWhiteboardRoom] = useCreateWhiteboardRoomMutation();
  const RTMClient = useRTMClient();
  const chatConnection = useChatConnection();
  const authRequestConfig = useAuthRequestConfig();
  const alert = useAlert();

  useDocumentTitle("Join/Create a channel");

  const handlePublicSearchFormSubmit: SubmitHandler<{
    publicSearchValue: string;
  }> = async (data) => {
    try {
      const response = await searchChannels(data.publicSearchValue).unwrap();

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
  }> = async (data) => {
    try {
      const channel = await fetchChannel(data.privateSearchValue).unwrap();

      await Promise.all([
        createRequest({
          from: userId ?? "",
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
    try {
      const whiteboardSdkToken =
        await fetchWhiteboardSdkToken(authRequestConfig);
      const whiteboardRoomCreationResponse = await createWhiteboardRoom({
        sdkToken: whiteboardSdkToken,
      }).unwrap();
      const whiteboardRoomId = JSON.parse(whiteboardRoomCreationResponse).uuid;
      const { data: chatData } = await chatConnection.createGroup({
        data: {
          groupname: data.channelName,
          desc: "",
          members: [userId ?? ""],
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
          admin: userId ?? "",
          participants: [userId ?? ""],
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
    try {
      const channel = await fetchChannel(channelId).unwrap();

      await Promise.all([
        joinChannel({ userId: userId ?? "", channelId }).unwrap(),
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
      console.log(err);
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
                  onSubmit={handlePublicSearchFormSubmit}
                  inputField={{
                    name: "publicSearchValue",
                    placeholder: "Enter name or id of the channel...",
                    required: true,
                  }}
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
                onSubmit={handlePrivateJoiningFormSubmit}
                inputField={{
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
            inputField={{
              name: "channelName",
              placeholder: "Enter a name for a channel...",
              required: true,
            }}
            checkboxField={{
              name: "isPrivate",
              label: "Private",
            }}
          />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default ChannelAdditionPage;
