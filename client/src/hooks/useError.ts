import { useEffect } from "react";

import { useAlert } from "react-alert";

import type CustomError from "../types/CustomError";

const useError = (message: CustomError) => {
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
