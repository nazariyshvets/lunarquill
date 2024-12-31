import { useEffect } from "react";

import { RtmClient } from "agora-rtm-react";

import showToast from "../utils/showToast";

import useAppDispatch from "./useAppDispatch";
import useAuth from "./useAuth";
import { useFetchRTMTokenMutation } from "../services/tokenApi";
import { setIsRTMClientInitialized } from "../redux/rtmSlice";

const useInitRTMClient = (RTMClient: RtmClient) => {
  const { userId } = useAuth();
  const [fetchRTMToken] = useFetchRTMTokenMutation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!userId) {
      return;
    }

    (async () => {
      try {
        const token = await fetchRTMToken(userId).unwrap();

        await RTMClient.login({ uid: userId, token });
        dispatch(setIsRTMClientInitialized(true));
      } catch (err) {
        dispatch(setIsRTMClientInitialized(false));
        showToast("error", "Could not initialize RTM client");
        console.error("RTM client initialization failed:", err);
      }
    })();

    return () => {
      RTMClient.logout().then(() => dispatch(setIsRTMClientInitialized(false)));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
};

export default useInitRTMClient;
