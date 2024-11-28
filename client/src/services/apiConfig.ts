import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { BASE_SERVER_URL, QUERY_TAG_TYPES } from "../constants/constants";
import { RootState } from "../redux/store";

export const apiBaseQuery = fetchBaseQuery({
  baseUrl: BASE_SERVER_URL + "/api",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.userToken;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const apiTagTypes = Object.values(QUERY_TAG_TYPES);
