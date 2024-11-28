import { createApi } from "@reduxjs/toolkit/query/react";

import { apiBaseQuery, apiTagTypes } from "./apiConfig";

export const whiteboardApi = createApi({
  reducerPath: "whiteboardApi",
  baseQuery: apiBaseQuery,
  tagTypes: apiTagTypes,
  endpoints: (builder) => ({
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
  useCreateWhiteboardRoomMutation,
  useDisableWhiteboardRoomMutation,
  useGetWhiteboardRoomsMutation,
} = whiteboardApi;
