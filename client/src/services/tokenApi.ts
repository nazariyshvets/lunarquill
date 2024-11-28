import { createApi } from "@reduxjs/toolkit/query/react";
import { UID } from "agora-rtc-react";

import { apiBaseQuery, apiTagTypes } from "./apiConfig";
import { TOKEN_EXPIRY_TIME } from "../constants/constants";

export const tokenApi = createApi({
  reducerPath: "tokenApi",
  baseQuery: apiBaseQuery,
  tagTypes: apiTagTypes,
  endpoints: (builder) => ({
    fetchRTCToken: builder.mutation<string, { channelName: string; uid: UID }>({
      query: ({ channelName, uid }) => ({
        url: `/rtc/${channelName}/publisher/userAccount/${uid}/?expiry=${TOKEN_EXPIRY_TIME}`,
        method: "GET",
      }),
    }),
    fetchRTMToken: builder.mutation<string, string>({
      query: (uid) => ({
        url: `/rtm/${uid}/?expiry=${TOKEN_EXPIRY_TIME}`,
        method: "GET",
      }),
    }),
    fetchChatToken: builder.mutation<string, string>({
      query: (uid) => ({
        url: `/chat/${uid}/${TOKEN_EXPIRY_TIME}`,
        method: "GET",
      }),
    }),
    fetchWhiteboardSdkToken: builder.mutation<{ token: string }, void>({
      query: () => ({
        url: "/whiteboard/sdk-token",
        method: "GET",
      }),
    }),
    fetchWhiteboardRoomToken: builder.mutation<{ token: string }, string>({
      query: (roomId) => ({
        url: `/whiteboard/room-token/${roomId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useFetchRTCTokenMutation,
  useFetchRTMTokenMutation,
  useFetchChatTokenMutation,
  useFetchWhiteboardSdkTokenMutation,
  useFetchWhiteboardRoomTokenMutation,
} = tokenApi;
