import { useEffect } from "react";

import { RtmClient } from "agora-rtm-react";

import useAuth from "./useAuth";
import { useFetchRTMTokenMutation } from "../services/tokenApi";
import showToast from "../utils/showToast";

const useRTMTokenExpired = (client: RtmClient) => {
  const { userId } = useAuth();
  const [fetchRTMToken] = useFetchRTMTokenMutation();

  useEffect(() => {
    const renewToken = async () => {
      if (!userId) {
        return;
      }

      try {
        const token = await fetchRTMToken(userId).unwrap();

        await client.renewToken(token);
      } catch (err) {
        showToast("error", "Could not renew RTM token");
        console.error("Error renewing RTM token:", err);
      }
    };

    client.on("TokenExpired", renewToken);

    return () => {
      client.off("TokenExpired", renewToken);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
};

export default useRTMTokenExpired;
