import { useEffect, useRef } from "react";

import { RtmClient } from "agora-rtm-react";

import useAuthRequestConfig from "./useAuthRequestConfig";
import useAppSelector from "./useAppSelector";
import useAppDispatch from "./useAppDispatch";
import useAuth from "./useAuth";
import { setIsRTMClientInitialized } from "../redux/rtmSlice";
import fetchRTMToken from "../utils/fetchRTMToken";
import RTMConfig from "../config/RTMConfig";

const useInitRTMClient = (RTMClient: RtmClient) => {
  const isInitialized = useAppSelector(
    (state) => state.rtm.isRTMClientInitialized,
  );
  const isLoadingRef = useRef(false);
  const { userId } = useAuth();
  const requestConfig = useAuthRequestConfig();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!RTMConfig.serverUrl || !userId) {
      console.warn("RTMConfig.serverUrl or userId is empty");
      return;
    }

    if (!isInitialized && !isLoadingRef.current)
      (async () => {
        isLoadingRef.current = true;

        try {
          const token = await fetchRTMToken(userId, requestConfig);

          RTMConfig.rtmToken = token;
          await RTMClient.login({ uid: userId, token });
          dispatch(setIsRTMClientInitialized(true));
        } catch (err) {
          dispatch(setIsRTMClientInitialized(false));
          console.log("RTM Client initialization failed:", err);
        } finally {
          isLoadingRef.current = false;
        }
      })();
  }, [RTMClient, requestConfig, isInitialized, dispatch, userId]);
};

export default useInitRTMClient;
