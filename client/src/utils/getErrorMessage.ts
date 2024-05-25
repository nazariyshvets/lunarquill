import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const getErrorMessage = ({
  error,
  defaultErrorMessage = "Something went wrong",
}: {
  error?: unknown;
  defaultErrorMessage?: string;
}) => {
  const queryError = error as FetchBaseQueryError;

  if (queryError && "status" in queryError && "data" in queryError)
    return queryError.data as string;

  return defaultErrorMessage;
};

export default getErrorMessage;
