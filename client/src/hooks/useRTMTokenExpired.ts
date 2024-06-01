import { useEffect } from "react";

import { RtmClient } from "agora-rtm-react";

import useAuth from "./useAuth";
import useAuthRequestConfig from "./useAuthRequestConfig";
import fetchRTMToken from "../utils/fetchRTMToken";
import RTMConfig from "../config/RTMConfig";

const useRTMTokenExpired = (client: RtmClient) => {
  const { userId } = useAuth();
  const requestConfig = useAuthRequestConfig();

  useEffect(() => {
    const renewToken = async () => {
      if (RTMConfig.serverUrl !== "" && userId) {
        try {
          const token = await fetchRTMToken(userId, requestConfig);

          if (token) await client.renewToken(token);
        } catch (err) {
          console.log(err);
        }
      } else
        console.log(
          "Please make sure you specified the RTM token server URL in the configuration file and user id is not empty",
        );
    };

    client.on("TokenExpired", renewToken);

    return () => {
      client.off("TokenExpired", renewToken);
    };
  }, [client, requestConfig, userId]);
};

export default useRTMTokenExpired;
