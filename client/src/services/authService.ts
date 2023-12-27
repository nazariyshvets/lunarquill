import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../redux/store";
import { BASE_SERVER_URL } from "../constants/constants";

export const mainApi = createApi({
  reducerPath: "mainApi",
  baseQuery: fetchBaseQuery({
    // base url of backend API
    baseUrl: BASE_SERVER_URL + "/api",
    // prepareHeaders is used to configure the header of every request and gives access to getState which we use to include the token from the store
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.userToken;

      if (token) {
        // include token in req header
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    requestPasswordReset: builder.mutation({
      query: (data) => ({
        url: "/users/request-password-reset",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/users/password-reset",
        method: "POST",
        body: data,
      }),
    }),
    getUserDetails: builder.query({
      query: () => "/profile",
      transformResponse: (response: { user: string }) => response.user,
    }),
  }),
});

// export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useGetUserDetailsQuery,
} = mainApi;
