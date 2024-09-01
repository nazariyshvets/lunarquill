import { useEffect } from "react";

import { useAlert } from "react-alert";

type ErrorMessage = string | Record<string, string> | null;

const useError = (message: ErrorMessage) => {
  const alert = useAlert();

  useEffect(() => {
    if (!message) return;

    if (typeof message === "string") {
      alert.error(message);
      console.error(message);
    } else {
      Object.values(message).forEach((errorMsg) => {
        alert.error(errorMsg);
        console.error(errorMsg);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);
};

export default useError;
