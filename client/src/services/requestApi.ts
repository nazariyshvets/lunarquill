import { createApi } from "@reduxjs/toolkit/query/react";

import { apiBaseQuery, apiTagTypes } from "./apiConfig";
import { userApi } from "./userApi";
import { channelApi } from "./channelApi";
import { QUERY_TAG_TYPES } from "../constants/constants";
import {
  PopulatedRequest,
  Request,
  RequestDto,
  RequestType,
} from "../types/Request";

export const requestApi = createApi({
  reducerPath: "requestApi",
  baseQuery: apiBaseQuery,
  tagTypes: apiTagTypes,
  endpoints: (builder) => ({
    createRequest: builder.mutation<PopulatedRequest, RequestDto>({
      query: (data) => ({
        url: "/requests",
        method: "POST",
        body: data,
      }),
      onQueryStarted: async (request, { dispatch, queryFulfilled }) => {
        try {
          const { data: response } = await queryFulfilled;
          const localUserId = response.from._id;
          const isChannelPublic = !response.channel?.isPrivate;

          dispatch(
            userApi.util.invalidateTags([
              { type: QUERY_TAG_TYPES.USER_REQUESTS, id: localUserId },
              ...(request.type === RequestType.Join && isChannelPublic
                ? [
                    {
                      type: QUERY_TAG_TYPES.USER_CHANNELS,
                      id: localUserId,
                    },
                  ]
                : []),
            ]),
          );
        } catch (error) {
          console.error("Error creating a request:", error);
        }
      },
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
      onQueryStarted: async ({ uid }, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(
            userApi.util.invalidateTags([
              {
                type: QUERY_TAG_TYPES.USER_REQUESTS,
                id: uid,
              },
            ]),
          );
        } catch (error) {
          console.error("Error declining the request:", error);
        }
      },
    }),
    acceptRequest: builder.mutation<
      Request,
      {
        requestId: string;
        uid: string;
        whiteboardRoomId?: string;
      }
    >({
      query: (data) => ({
        url: "/requests/accept",
        method: "POST",
        body: data,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data: response } = await queryFulfilled;
          const requestType = response.type;
          const localUserId = response.to || undefined;

          dispatch(
            userApi.util.invalidateTags([
              {
                type: QUERY_TAG_TYPES.USER_REQUESTS,
                id: localUserId,
              },
              ...(requestType === RequestType.Contact
                ? [
                    {
                      type: QUERY_TAG_TYPES.USER_CONTACTS,
                      id: localUserId,
                    },
                  ]
                : []),
              ...(requestType === RequestType.Invite
                ? [
                    {
                      type: QUERY_TAG_TYPES.USER_CHANNELS,
                      id: localUserId,
                    },
                  ]
                : []),
            ]),
          );

          if (requestType === RequestType.Join) {
            dispatch(
              channelApi.util.invalidateTags([
                {
                  type: QUERY_TAG_TYPES.CHANNEL_MEMBERS,
                  id: response.channel,
                },
              ]),
            );
          }
        } catch (error) {
          console.error("Error accepting the request:", error);
        }
      },
    }),
  }),
});

export const {
  useCreateRequestMutation,
  useDeclineRequestMutation,
  useAcceptRequestMutation,
} = requestApi;
