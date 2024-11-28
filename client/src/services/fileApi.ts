import { createApi } from "@reduxjs/toolkit/query/react";

import { apiBaseQuery, apiTagTypes } from "./apiConfig";
import { File as CustomFile } from "../types/File";

export const fileApi = createApi({
  reducerPath: "fileApi",
  baseQuery: apiBaseQuery,
  tagTypes: apiTagTypes,
  endpoints: (builder) => ({
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
  useUploadFileMutation,
  useDownloadFileQuery,
  useDownloadFilesMutation,
  useRemoveFileMutation,
} = fileApi;
