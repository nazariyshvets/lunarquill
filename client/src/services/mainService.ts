import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { RootState } from "../redux/store";
import { BASE_SERVER_URL } from "../constants/constants";
import type Request from "../types/Request";
import type { UserWithoutPassword } from "../types/User";
import type {
  IUser,
  IUserWithoutPassword,
} from "../../../server/src/models/User";
import type { IPopulatedRequest } from "../../../server/src/models/Request";
import type { IChannel } from "../../../server/src/models/Channel";
import type { IPopulatedContact } from "../../../server/src/models/Contact";

export const mainApi = createApi({
  reducerPath: "mainApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_SERVER_URL + "/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.userToken;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["user-details", "user-requests", "user-contacts", "user-channels"],
  endpoints: (builder) => ({
    // ===== AUTH =====

    verifyAccount: builder.mutation({
      query: (data) => ({
        url: "/auth/account-verification",
        method: "POST",
        body: data,
      }),
    }),
    requestPasswordReset: builder.mutation({
      query: (data) => ({
        url: "/auth/request-password-reset",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/password-reset",
        method: "POST",
        body: data,
      }),
    }),

    // ===== USERS =====

    getUserContacts: builder.query<UserWithoutPassword[], string>({
      query: (userId) => `/users/${userId}/contacts`,
      providesTags: ["user-contacts"],
    }),
    fetchUserContacts: builder.mutation<UserWithoutPassword[], string>({
      query: (userId) => ({
        url: `/users/${userId}/contacts`,
        method: "GET",
      }),
    }),
    getUserChannels: builder.query<IChannel[], string>({
      query: (userId) => `/users/${userId}/channels`,
      providesTags: ["user-channels"],
    }),
    getUserById: builder.query<UserWithoutPassword, string>({
      query: (userId) => `/users/${userId}`,
      keepUnusedDataFor: 0,
      providesTags: ["user-details"],
    }),
    fetchUserById: builder.mutation<UserWithoutPassword, string>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "GET",
      }),
    }),
    updateUserById: builder.mutation<
      IUserWithoutPassword,
      { userId: string; updateData: Partial<IUser> }
    >({
      query: (data) => ({
        url: `/users/${data.userId}`,
        method: "PUT",
        body: data.updateData,
      }),
      invalidatesTags: ["user-details"],
    }),

    // ===== REQUESTS =====

    createRequest: builder.mutation<IPopulatedRequest, Request>({
      query: (data) => ({
        url: "/requests",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["user-requests", "user-channels"],
    }),
    getUserRequests: builder.query<IPopulatedRequest[], string>({
      query: (uid) => `/requests/user-requests/${uid}`,
      providesTags: ["user-requests"],
    }),
    declineRequest: builder.mutation<
      { success: true },
      { requestId: string; uid: string }
    >({
      query: (data) => ({
        url: "/requests/decline",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["user-requests"],
    }),
    acceptRequest: builder.mutation<
      { success: true },
      { requestId: string; uid: string; whiteboardRoomId?: string }
    >({
      query: (data) => ({
        url: "/requests/accept",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["user-requests", "user-contacts", "user-channels"],
    }),

    //   ===== CHANNELS =====

    createChannel: builder.mutation<
      IChannel,
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
      invalidatesTags: ["user-channels"],
    }),
    searchChannels: builder.mutation<IChannel[], string>({
      query: (name) => ({
        url: `/channels/search?name=${name}`,
        method: "GET",
      }),
    }),
    joinChannel: builder.mutation<
      IChannel,
      { userId: string; channelId: string }
    >({
      query: (data) => ({
        url: "/channels/join",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["user-channels"],
    }),
    leaveChannel: builder.mutation<
      { message: string },
      { userId: string; channelId: string }
    >({
      query: (data) => ({
        url: "/channels/leave",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["user-channels"],
    }),
    getChannelById: builder.query<IChannel, string>({
      query: (id) => `/channels/${id}`,
    }),
    fetchChannelById: builder.mutation<IChannel, string>({
      query: (id) => ({
        url: `/channels/${id}`,
        method: "GET",
      }),
    }),

    //   ===== CONTACTS =====

    fetchContactRelation: builder.mutation<
      IPopulatedContact,
      { userId1: string; userId2: string }
    >({
      query: ({ userId1, userId2 }) => ({
        url: `/contacts/${userId1}/${userId2}`,
        method: "GET",
      }),
    }),
    getContactById: builder.query<IPopulatedContact, string>({
      query: (id) => `/contacts/${id}`,
    }),
    removeContact: builder.mutation<
      { message: string },
      { user1Id: string; user2Id: string }
    >({
      query: (data) => ({
        url: "/contacts/relation",
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["user-contacts"],
    }),

    // WHITEBOARD
    createWhiteboardRoom: builder.mutation<string, { sdkToken: string }>({
      query: (data) => ({
        url: "/whiteboard/rooms",
        method: "POST",
        body: data,
      }),
    }),
    disableWhiteboardRoom: builder.mutation<
      string,
      { roomUuid: string; sdkToken: string }
    >({
      query: (data) => ({
        url: "/whiteboard/rooms",
        method: "PATCH",
        body: data,
      }),
    }),
    getWhiteboardRooms: builder.mutation<string, string>({
      query: (sdkToken) => ({
        url: `/whiteboard/rooms/${sdkToken}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  // AUTH
  useVerifyAccountMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  // USERS
  useGetUserContactsQuery,
  useFetchUserContactsMutation,
  useGetUserChannelsQuery,
  useGetUserByIdQuery,
  useFetchUserByIdMutation,
  useUpdateUserByIdMutation,
  // REQUESTS
  useCreateRequestMutation,
  useGetUserRequestsQuery,
  useDeclineRequestMutation,
  useAcceptRequestMutation,
  // CHANNELS
  useCreateChannelMutation,
  useSearchChannelsMutation,
  useJoinChannelMutation,
  useLeaveChannelMutation,
  useGetChannelByIdQuery,
  useFetchChannelByIdMutation,
  // CONTACTS
  useFetchContactRelationMutation,
  useGetContactByIdQuery,
  useRemoveContactMutation,
  // WHITEBOARD
  useCreateWhiteboardRoomMutation,
  useDisableWhiteboardRoomMutation,
  useGetWhiteboardRoomsMutation,
} = mainApi;
