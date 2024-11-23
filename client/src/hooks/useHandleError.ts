import { useCallback } from "react";

import { useAlert } from "react-alert";

import getErrorMessage from "../utils/getErrorMessage";

const useHandleError = () => {
  const alert = useAlert();

  return useCallback(
    (error: unknown, defaultAlertMessage: string, consoleMessage: string) => {
      alert.error(
        getErrorMessage({
          error,
          defaultErrorMessage: defaultAlertMessage,
        }),
      );
      console.error(consoleMessage, error);
    },
    [alert],
  );
};

export default useHandleError;
