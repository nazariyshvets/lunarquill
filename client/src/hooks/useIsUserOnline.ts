import { useCallback } from "react";

import useAppSelector from "./useAppSelector";

const useIsUserOnline = () => {
  const { onlineContactIds } = useAppSelector((state) => state.rtm);

  return useCallback(
    (userId?: string) =>
      !!userId && onlineContactIds.some((id) => id === userId),
    [onlineContactIds],
  );
};

export default useIsUserOnline;
