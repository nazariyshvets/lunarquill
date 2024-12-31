import { useEffect } from "react";

import useAuth from "./useAuth";
import useAppDispatch from "./useAppDispatch";
import { clearError } from "../redux/authSlice";
import showToast from "../utils/showToast";

const useAuthError = () => {
  const { error } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!error) {
      return;
    }

    if (typeof error === "string") {
      showToast("error", error);
      console.error(error);
    } else {
      Object.values(error).forEach((errorMsg) => {
        showToast("error", errorMsg);
        console.error(errorMsg);
      });
    }

    dispatch(clearError());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);
};

export default useAuthError;
