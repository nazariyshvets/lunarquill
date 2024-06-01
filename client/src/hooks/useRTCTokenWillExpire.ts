import { useClientEvent, IAgoraRTCClient, UID } from "agora-rtc-react";

import useAuthRequestConfig from "./useAuthRequestConfig";
import fetchRTCToken from "../utils/fetchRTCToken";
import RTCConfig from "../config/RTCConfig";

const useRTCTokenWillExpire = (
  client: IAgoraRTCClient,
  channelName: string,
  uid: UID,
) => {
  const requestConfig = useAuthRequestConfig();

  useClientEvent(client, "token-privilege-will-expire", async () => {
    if (RTCConfig.serverUrl !== "") {
      try {
        const token = await fetchRTCToken(channelName, uid, requestConfig);

        if (token) return client.renewToken(token);
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log(
        "Please make sure you specified the RTC token server URL in the configuration file",
      );
    }
  });
};

export default useRTCTokenWillExpire;
