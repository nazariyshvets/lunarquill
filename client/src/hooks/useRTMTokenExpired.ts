import { useEffect } from "react";

import { RtmClient } from "agora-rtm-react";
import { useAlert } from "react-alert";

import useAuth from "./useAuth";
import { useFetchRTMTokenMutation } from "../services/mainService";

const useRTMTokenExpired = (client: RtmClient) => {
  const { userId } = useAuth();
  const [fetchRTMToken] = useFetchRTMTokenMutation();
  const alert = useAlert();

  useEffect(() => {
    if (!userId) return;

    const renewToken = async () => {
      try {
        const token = await fetchRTMToken(userId).unwrap();

        await client.renewToken(token);
      } catch (err) {
        alert.error("Could not renew RTM token");
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
