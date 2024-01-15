import { useEffect } from "react";
import { RtmClient } from "agora-rtm-react";
import useAuthRequestConfig from "./useAuthRequestConfig";
import fetchRTMToken from "../utils/fetchRTMToken";
import RTMConfig from "../config/RTMConfig";

const useRTMTokenExpired = (client: RtmClient) => {
  const requestConfig = useAuthRequestConfig();

  useEffect(() => {
    const renewToken = async () => {
      if (RTMConfig.serverUrl !== "") {
        try {
          const token = await fetchRTMToken(RTMConfig.uid, requestConfig);

          if (token) {
            client.renewToken(token);
          }
        } catch (err) {
          console.log(err);
        }
      } else {
        console.log(
          "Please make sure you specified the RTM token server URL in the configuration file",
        );
      }
    };

    client.on("TokenExpired", renewToken);

    return () => {
      client.off("TokenExpired", renewToken);
    };
  }, [client, requestConfig]);
};

export default useRTMTokenExpired;
