import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { RootState } from "../redux/store";
import { BASE_SERVER_URL } from "../constants/constants";
import type Request from "../types/Request";
import type {
  IUser,
  IUserWithoutPassword,
} from "../../../server/src/models/User";
import type { IPopulatedRequest } from "../../../server/src/models/Request";
import type { IChannel } from "../../../server/src/models/Channel";

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
  tagTypes: ["user-requests", "user-contacts", "user-channels"],
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

    getUserDetails: builder.query({
      query: () => "/users/profile",
      transformResponse: (response: { user: IUser }) => response.user,
      keepUnusedDataFor: 0,
    }),
    getUserContacts: builder.query<IUserWithoutPassword[], string>({
      query: (userId) => `/users/${userId}/contacts`,
      providesTags: ["user-contacts"],
    }),
    getUserChannels: builder.query<IChannel[], string>({
      query: (userId) => `/users/${userId}/channels`,
      providesTags: ["user-channels"],
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
      { requestId: string; uid: string }
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
  }),
});

export const {
  // AUTH
  useVerifyAccountMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  // USERS
  useGetUserDetailsQuery,
  useGetUserContactsQuery,
  useGetUserChannelsQuery,
  // REQUESTS
  useCreateRequestMutation,
  useGetUserRequestsQuery,
  useDeclineRequestMutation,
  useAcceptRequestMutation,
  // CHANNELS
  useCreateChannelMutation,
  useSearchChannelsMutation,
  useJoinChannelMutation,
} = mainApi;
