import { createApi } from "@reduxjs/toolkit/query/react";

import { apiBaseQuery, apiTagTypes } from "./apiConfig";
import { userApi } from "./userApi";
import { prepareAvatarsCollectionMutationPayload } from "./mutationHelpers";
import { QUERY_TAG_TYPES } from "../constants/constants";
import { UserWithoutPassword } from "../types/User";
import { ChannelDto, Channel } from "../types/Channel";
import {
  AvatarsUpdateRequestPayload,
  AvatarsUpdateResponsePayload,
} from "../types/Avatar";

export const channelApi = createApi({
  reducerPath: "channelApi",
  baseQuery: apiBaseQuery,
  tagTypes: apiTagTypes,
  endpoints: (builder) => ({
    createChannel: builder.mutation<
      Channel,
      {
        name: string;
        admin: string;
        participants: string[];
        chatTargetId: string;
        whiteboardRoomId: string;
        isPrivate?: boolean;
      }
    >({
      query: (data) => ({
        url: "/channels",
        method: "POST",
        body: data,
      }),
      onQueryStarted: async (
        { participants },
        { dispatch, queryFulfilled },
      ) => {
        try {
          await queryFulfilled;
          dispatch(
            userApi.util.invalidateTags(
              participants.map((participantId) => ({
                type: QUERY_TAG_TYPES.USER_CHANNELS,
                id: participantId,
              })),
            ),
          );
        } catch (error) {
          console.error("Error creating a channel:", error);
        }
      },
    }),
    updateChannel: builder.mutation<
      Channel,
      {
        localUserId: string;
        channelId: string;
        updateData: Partial<ChannelDto>;
      }
    >({
      query: ({ channelId, updateData }) => ({
        url: `/channels/${channelId}`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: (response, _, { channelId }) =>
        response ? [{ type: QUERY_TAG_TYPES.CHANNEL, id: channelId }] : [],
      onQueryStarted: async ({ localUserId }, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(
            userApi.util.invalidateTags([
              {
                type: QUERY_TAG_TYPES.USER_CHANNELS,
                id: localUserId,
              },
            ]),
          );
        } catch (error) {
          console.error("Error joining the channel:", error);
        }
      },
    }),
    searchChannels: builder.mutation<Channel[], string>({
      query: (name) => ({
        url: `/channels/search?name=${name}`,
        method: "GET",
      }),
    }),
    joinChannel: builder.mutation<
      Channel,
      { userId: string; channelId: string }
    >({
      query: (data) => ({
        url: "/channels/join",
        method: "PUT",
        body: data,
      }),
      onQueryStarted: async ({ userId }, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(
            userApi.util.invalidateTags([
              {
                type: QUERY_TAG_TYPES.USER_CHANNELS,
                id: userId,
              },
            ]),
          );
        } catch (error) {
          console.error("Error joining the channel:", error);
        }
      },
    }),
    leaveChannel: builder.mutation<
      { isChannelRemoved: boolean; adminId?: string },
      { userId: string; channelId: string }
    >({
      query: (data) => ({
        url: "/channels/leave",
        method: "POST",
        body: data,
      }),
      onQueryStarted: async ({ userId }, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(
            userApi.util.invalidateTags([
              {
                type: QUERY_TAG_TYPES.USER_CHANNELS,
                id: userId,
              },
            ]),
          );
        } catch (error) {
          console.error("Error leaving the channel:", error);
        }
      },
    }),
    kickUserOutOfChannel: builder.mutation<
      { message: string },
      { adminId: string; targetUserId: string; channelId: string }
    >({
      query: (data) => ({
        url: "/channels/kick-user",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (response, _, { channelId }) =>
        response
          ? [{ type: QUERY_TAG_TYPES.CHANNEL_MEMBERS, id: channelId }]
          : [],
    }),
    getChannelById: builder.query<Channel, string>({
      query: (id) => `/channels/${id}`,
      providesTags: (_, __, id) => [{ type: QUERY_TAG_TYPES.CHANNEL, id }],
    }),
    fetchChannelById: builder.mutation<Channel, string>({
      query: (id) => ({
        url: `/channels/${id}`,
        method: "GET",
      }),
    }),
    updateChannelAvatarsCollection: builder.mutation<
      AvatarsUpdateResponsePayload,
      {
        userId: string;
        channelId: string;
        updateData: AvatarsUpdateRequestPayload;
      }
    >({
      query: ({ channelId, updateData }) => ({
        url: `/channels/${channelId}/avatars-collection`,
        method: "PUT",
        body: prepareAvatarsCollectionMutationPayload(updateData),
      }),
      invalidatesTags: (response, _, { channelId }) =>
        response ? [{ type: QUERY_TAG_TYPES.CHANNEL, id: channelId }] : [],
      onQueryStarted: async ({ userId }, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(
            userApi.util.invalidateTags([
              {
                type: QUERY_TAG_TYPES.USER_CHANNELS,
                id: userId,
              },
            ]),
          );
        } catch (error) {
          console.error("Error updating channel avatars collection:", error);
        }
      },
    }),
    getChannelMembers: builder.query<UserWithoutPassword[], string>({
      query: (channelId) => `/channels/${channelId}/members`,
      providesTags: (_, __, id) => [
        { type: QUERY_TAG_TYPES.CHANNEL_MEMBERS, id },
      ],
    }),
    fetchChannelMembers: builder.mutation<UserWithoutPassword[], string>({
      query: (channelId) => ({
        url: `/channels/${channelId}/members`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateChannelMutation,
  useUpdateChannelMutation,
  useSearchChannelsMutation,
  useJoinChannelMutation,
  useLeaveChannelMutation,
  useKickUserOutOfChannelMutation,
  useGetChannelByIdQuery,
  useFetchChannelByIdMutation,
  useUpdateChannelAvatarsCollectionMutation,
  useGetChannelMembersQuery,
  useFetchChannelMembersMutation,
} = channelApi;
