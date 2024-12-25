import { createApi } from "@reduxjs/toolkit/query/react";

import { apiBaseQuery, apiTagTypes } from "./apiConfig";
import { prepareAvatarsCollectionMutationPayload } from "./mutationHelpers";
import { QUERY_TAG_TYPES } from "../constants/constants";
import { UserWithoutPassword } from "../types/User";
import { Channel } from "../types/Channel";
import { PopulatedRequest } from "../types/Request";
import {
  AvatarsUpdateRequestPayload,
  AvatarsUpdateResponsePayload,
} from "../types/Avatar";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: apiBaseQuery,
  tagTypes: apiTagTypes,
  endpoints: (builder) => ({
    getUserContacts: builder.query<UserWithoutPassword[], string>({
      query: (userId) => `/users/${userId}/contacts`,
      providesTags: (_, __, id) => [
        { type: QUERY_TAG_TYPES.USER_CONTACTS, id },
      ],
    }),
    fetchUserContacts: builder.mutation<UserWithoutPassword[], string>({
      query: (userId) => ({
        url: `/users/${userId}/contacts`,
        method: "GET",
      }),
    }),
    getUserChannels: builder.query<Channel[], string>({
      query: (userId) => `/users/${userId}/channels`,
      providesTags: (_, __, id) => [
        { type: QUERY_TAG_TYPES.USER_CHANNELS, id },
      ],
    }),
    getUserRequests: builder.query<PopulatedRequest[], string>({
      query: (userId) => `/users/${userId}/requests`,
      providesTags: (_, __, id) => [
        { type: QUERY_TAG_TYPES.USER_REQUESTS, id },
      ],
    }),
    getUserById: builder.query<UserWithoutPassword, string>({
      query: (userId) => `/users/${userId}`,
      keepUnusedDataFor: 0,
      providesTags: (_, __, id) => [{ type: QUERY_TAG_TYPES.USER_DETAILS, id }],
    }),
    fetchUserById: builder.mutation<UserWithoutPassword, string>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "GET",
      }),
    }),
    updateUserById: builder.mutation<
      UserWithoutPassword,
      { userId: string; updateData: Partial<UserWithoutPassword> }
    >({
      query: ({ userId, updateData }) => ({
        url: `/users/${userId}`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: (response, _, { userId }) =>
        response ? [{ type: QUERY_TAG_TYPES.USER_DETAILS, id: userId }] : [],
    }),
    updateUserAvatarsCollection: builder.mutation<
      AvatarsUpdateResponsePayload,
      {
        userId: string;
        updateData: AvatarsUpdateRequestPayload;
      }
    >({
      query: ({ userId, updateData }) => ({
        url: `/users/${userId}/avatars-collection`,
        method: "PUT",
        body: prepareAvatarsCollectionMutationPayload(updateData),
      }),
      invalidatesTags: (response, _, { userId }) =>
        response ? [{ type: QUERY_TAG_TYPES.USER_DETAILS, id: userId }] : [],
    }),
  }),
});

export const {
  useGetUserContactsQuery,
  useFetchUserContactsMutation,
  useGetUserChannelsQuery,
  useGetUserRequestsQuery,
  useGetUserByIdQuery,
  useFetchUserByIdMutation,
  useUpdateUserByIdMutation,
  useUpdateUserAvatarsCollectionMutation,
} = userApi;
