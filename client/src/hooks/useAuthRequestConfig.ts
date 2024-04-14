import { useMemo } from "react";

import useAuth from "./useAuth";

const useAuthRequestConfig = () => {
  const { userToken } = useAuth();

  return useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }),
    [userToken],
  );
};

export default useAuthRequestConfig;
