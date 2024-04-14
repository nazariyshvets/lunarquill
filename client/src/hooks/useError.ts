import { useEffect } from "react";

import { useAlert } from "react-alert";

type ErrorMessage = string | Record<string, string> | null;

const useError = (message: ErrorMessage) => {
  const alert = useAlert();

  useEffect(() => {
    if (!message) return;

    if (typeof message === "string") {
      // If the message is a string, show it as is
      alert.error(message);
    } else {
      // If the message is an object, iterate over its properties and show each one
      Object.values(message).forEach((errorMsg) => alert.error(errorMsg));
    }
  }, [alert, message]);
};

export default useError;
