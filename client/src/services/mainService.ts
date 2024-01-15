import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../redux/store";
import { BASE_SERVER_URL } from "../constants/constants";

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
  endpoints: (builder) => ({
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
    getUserDetails: builder.query({
      query: () => "/profile",
      transformResponse: (response: { user: string }) => response.user,
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useVerifyAccountMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useGetUserDetailsQuery,
} = mainApi;
