import { useEffect } from "react";

import { RtmClient } from "agora-rtm-react";
import { useAlert } from "react-alert";

import useAppDispatch from "./useAppDispatch";
import useAuth from "./useAuth";
import useAppSelector from "./useAppSelector";
import { useFetchRTMTokenMutation } from "../services/tokenApi";
import { setIsRTMClientInitialized } from "../redux/rtmSlice";

const useInitRTMClient = (RTMClient: RtmClient) => {
  const { userId } = useAuth();
  const [fetchRTMToken] = useFetchRTMTokenMutation();
  const dispatch = useAppDispatch();
  const isRTMClientInitialized = useAppSelector(
    (state) => state.rtm.isRTMClientInitialized,
  );
  const alert = useAlert();

  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const token = await fetchRTMToken(userId).unwrap();

        await RTMClient.login({ uid: userId, token });
        dispatch(setIsRTMClientInitialized(true));
      } catch (err) {
        dispatch(setIsRTMClientInitialized(false));
        alert.error("Could not initialize RTM client");
        console.error("RTM client initialization failed:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(
    () => () => {
      if (isRTMClientInitialized) {
        RTMClient.logout().then(() =>
          dispatch(setIsRTMClientInitialized(false)),
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [RTMClient],
  );
};

export default useInitRTMClient;
