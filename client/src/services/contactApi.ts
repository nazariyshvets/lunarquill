import { createApi } from "@reduxjs/toolkit/query/react";

import { apiBaseQuery, apiTagTypes } from "./apiConfig";
import { userApi } from "./userApi";
import { QUERY_TAG_TYPES } from "../constants/constants";
import { PopulatedContact } from "../types/User";

export const contactApi = createApi({
  reducerPath: "contactApi",
  baseQuery: apiBaseQuery,
  tagTypes: apiTagTypes,
  endpoints: (builder) => ({
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
      onQueryStarted: async (
        { user1Id, user2Id },
        { dispatch, queryFulfilled },
      ) => {
        try {
          await queryFulfilled;
          dispatch(
            userApi.util.invalidateTags(
              [user1Id, user2Id].map((id) => ({
                type: QUERY_TAG_TYPES.USER_CONTACTS,
                id,
              })),
            ),
          );
        } catch (error) {
          console.error("Error removing the contact:", error);
        }
      },
    }),
  }),
});

export const {
  useGetContactRelationQuery,
  useFetchContactRelationMutation,
  useGetContactByIdQuery,
  useRemoveContactMutation,
} = contactApi;
