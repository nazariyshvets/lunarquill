import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError =>
  typeof error === "object" && error != null && "status" in error;

export default isFetchBaseQueryError;
