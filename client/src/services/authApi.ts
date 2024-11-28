import { createApi } from "@reduxjs/toolkit/query/react";

import { apiBaseQuery, apiTagTypes } from "./apiConfig";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: apiBaseQuery,
  tagTypes: apiTagTypes,
  endpoints: (builder) => ({
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
  }),
});

export const {
  useVerifyAccountMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
} = authApi;
