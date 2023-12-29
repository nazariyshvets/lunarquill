import { useEffect } from "react";
import useAuth from "./useAuth";
import useAppDispatch from "./useAppDispatch";
import useError from "./useError";
import { clearError } from "../redux/authSlice";

const useAuthError = () => {
  const { error } = useAuth();
  const dispatch = useAppDispatch();
  useError(error || null);

  useEffect(() => {
    // Clear the error when the component unmounts (page change)
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);
};

export default useAuthError;
