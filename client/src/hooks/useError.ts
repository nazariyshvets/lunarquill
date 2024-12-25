import { useEffect } from "react";

import showToast from "../utils/showToast";

import type CustomError from "../types/CustomError";

const useError = (message: CustomError) => {
  useEffect(() => {
    if (!message) {
      return;
    }

    if (typeof message === "string") {
      showToast("error", message);
      console.error(message);
    } else {
      Object.values(message).forEach((errorMsg) => {
        showToast("error", errorMsg);
        console.error(errorMsg);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);
};

export default useError;
