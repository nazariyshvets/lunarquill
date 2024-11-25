import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { UID } from "agora-rtc-react";

import { RootState } from "../redux/store";
import {
  BASE_SERVER_URL,
  QUERY_TAG_TYPES,
  TOKEN_EXPIRY_TIME,
} from "../constants/constants";
import { RequestDto, PopulatedRequest } from "../types/Request";
import {
  UserWithoutPassword,
  PopulatedUserWithoutPassword,
  PopulatedContact,
  ProfileAvatarsUpdateRequestPayload,
} from "../types/User";
import { Channel, PopulatedChannel } from "../types/Channel";
import { File as CustomFile } from "../types/File";

const createUpdateAvatarsCollectionMutation = (
  tagTypes: QUERY_TAG_TYPES[],
): {
  query: (args: {
    id: string;
    updateData: ProfileAvatarsUpdateRequestPayload;
  }) => {
    url: string;
    method: string;
    body: FormData;
  };
  invalidatesTags: (
    result:
      | {
          message: string;
          avatars: string[];
          selectedAvatar?: string;
          frontendIdToObjectIdMap: Record<string, string>;
        }
      | undefined,
    error: FetchBaseQueryError | undefined,
    arg: { id: string },
  ) => { type: QUERY_TAG_TYPES }[];
} => ({
  query: ({ id, updateData }) => {
    const formData = new FormData();

    updateData.removedAvatarIds.forEach((id) => {
      formData.append("removedAvatarIds[]", id);
    });
    updateData.newAvatars.forEach((avatar) => {
      formData.append("files", avatar.src);
      formData.append("newAvatarIds[]", avatar.id);
    });

    if (updateData.selectedAvatarId) {
      formData.append("selectedAvatarId", updateData.selectedAvatarId);
    }

    return {
      url: `/${
        tagTypes.includes(QUERY_TAG_TYPES.USER_DETAILS) ? "users" : "channels"
      }/${id}/avatars-collection`,
      method: "PUT",
      body: formData,
    };
  },
  invalidatesTags: (_, __, { id }) =>
    tagTypes.map((type) => ({
      type,
      ...(type === QUERY_TAG_TYPES.CHANNEL ? { id } : {}),
    })),
});

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
  tagTypes: Object.values(QUERY_TAG_TYPES),
  endpoints: (builder) => ({
    // ===== AUTH =====

    verifyAccount: builder.mutation<void, { userId: string; token: string }>({
      query: (data) => ({
        url: "/auth/account-verification",
        method: "POST",
        body: data,
      }),
    }),
    requestPasswordReset: builder.mutation<void, { email: string }>({
      query: (data) => ({
        url: "/auth/request-password-reset",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation<
      void,
      { userId: string; token: string; password: string; password2: string }
    >({
      query: (data) => ({
        url: "/auth/password-reset",
        method: "POST",
        body: data,
      }),
    }),

    // ===== USERS =====

    getUserContacts: builder.query<PopulatedUserWithoutPassword[], string>({
      query: (userId) => `/users/${userId}/contacts`,
      providesTags: [QUERY_TAG_TYPES.USER_CONTACTS],
    }),
    fetchUserContacts: builder.mutation<PopulatedUserWithoutPassword[], string>(
      {
        query: (userId) => ({
          url: `/users/${userId}/contacts`,
          method: "GET",
        }),
      },
    ),
    getUserChannels: builder.query<PopulatedChannel[], string>({
      query: (userId) => `/users/${userId}/channels`,
      providesTags: [QUERY_TAG_TYPES.USER_CHANNELS],
    }),
    getUserById: builder.query<PopulatedUserWithoutPassword, string>({
      query: (userId) => `/users/${userId}`,
      keepUnusedDataFor: 0,
      providesTags: [QUERY_TAG_TYPES.USER_DETAILS],
    }),
    fetchUserById: builder.mutation<PopulatedUserWithoutPassword, string>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "GET",
      }),
    }),
    updateUserById: builder.mutation<
      UserWithoutPassword,
      { userId: string; updateData: Partial<UserWithoutPassword> }
    >({
      query: (data) => ({
        url: `/users/${data.userId}`,
        method: "PUT",
        body: data.updateData,
      }),
      invalidatesTags: [QUERY_TAG_TYPES.USER_DETAILS],
    }),
    updateUserAvatarsCollection: builder.mutation(
      createUpdateAvatarsCollectionMutation([QUERY_TAG_TYPES.USER_DETAILS]),
    ),

    // ===== REQUESTS =====

    createRequest: builder.mutation<PopulatedRequest, RequestDto>({
      query: (data) => ({
        url: "/requests",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        QUERY_TAG_TYPES.USER_REQUESTS,
        QUERY_TAG_TYPES.USER_CHANNELS,
      ],
    }),
    getUserRequests: builder.query<PopulatedRequest[], string>({
      query: (uid) => `/requests/user-requests/${uid}`,
      providesTags: [QUERY_TAG_TYPES.USER_REQUESTS],
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
      invalidatesTags: [QUERY_TAG_TYPES.USER_REQUESTS],
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
      invalidatesTags: [
        QUERY_TAG_TYPES.USER_REQUESTS,
        QUERY_TAG_TYPES.USER_CONTACTS,
        QUERY_TAG_TYPES.USER_CHANNELS,
      ],
    }),

    //   ===== CHANNELS =====

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
      invalidatesTags: [QUERY_TAG_TYPES.USER_CHANNELS],
    }),
    searchChannels: builder.mutation<PopulatedChannel[], string>({
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
      invalidatesTags: [QUERY_TAG_TYPES.USER_CHANNELS],
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
      invalidatesTags: [QUERY_TAG_TYPES.USER_CHANNELS],
    }),
    getChannelById: builder.query<PopulatedChannel, string>({
      query: (id) => `/channels/${id}`,
      providesTags: (_, __, id) => [{ type: QUERY_TAG_TYPES.CHANNEL, id }],
    }),
    fetchChannelById: builder.mutation<PopulatedChannel, string>({
      query: (id) => ({
        url: `/channels/${id}`,
        method: "GET",
      }),
    }),
    updateChannelAvatarsCollection: builder.mutation(
      createUpdateAvatarsCollectionMutation([
        QUERY_TAG_TYPES.USER_CHANNELS,
        QUERY_TAG_TYPES.CHANNEL,
      ]),
    ),

    //   ===== CONTACTS =====

    getContactRelation: builder.query<
      PopulatedContact,
      { userId1: string; userId2: string }
    >({
      query: ({ userId1, userId2 }) => ({
        url: `/contacts/${userId1}/${userId2}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
    }),
    fetchContactRelation: builder.mutation<
      PopulatedContact,
      { userId1: string; userId2: string }
    >({
      query: ({ userId1, userId2 }) => ({
        url: `/contacts/${userId1}/${userId2}`,
        method: "GET",
      }),
    }),
    getContactById: builder.query<PopulatedContact, string>({
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
      invalidatesTags: [QUERY_TAG_TYPES.USER_CONTACTS],
    }),

    // ===== WHITEBOARD =====

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

    //   ===== TOKENS =====

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

    // ===== FILES =====

    uploadFile: builder.mutation<CustomFile, File>({
      query: (file) => {
        const formData = new FormData();

        formData.append("file", file);

        return {
          url: "/files",
          method: "POST",
          body: formData,
        };
      },
    }),
    downloadFile: builder.query<Blob, string>({
      query: (fileId) => ({
        url: `/files/${fileId}/download`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
    downloadFiles: builder.mutation<Blob, string[]>({
      query: (fileIds) => ({
        url: "/files/download",
        method: "POST",
        body: { fileIds },
        responseHandler: (response) =>
          response.ok ? response.blob() : response.json(),
      }),
    }),
    removeFile: builder.mutation<void, string>({
      query: (fileId) => ({
        url: `/files/${fileId}`,
        method: "DELETE",
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
  useUpdateUserAvatarsCollectionMutation,
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
  useUpdateChannelAvatarsCollectionMutation,
  // CONTACTS
  useGetContactRelationQuery,
  useFetchContactRelationMutation,
  useGetContactByIdQuery,
  useRemoveContactMutation,
  // WHITEBOARD
  useCreateWhiteboardRoomMutation,
  useDisableWhiteboardRoomMutation,
  useGetWhiteboardRoomsMutation,
  // TOKENS
  useFetchRTCTokenMutation,
  useFetchRTMTokenMutation,
  useFetchChatTokenMutation,
  useFetchWhiteboardSdkTokenMutation,
  useFetchWhiteboardRoomTokenMutation,
  // FILES
  useUploadFileMutation,
  useDownloadFileQuery,
  useDownloadFilesMutation,
  useRemoveFileMutation,
} = mainApi;
