import { UID } from "agora-rtc-react";
import axios, { AxiosRequestConfig } from "axios";

import RTCConfig from "../config/RTCConfig";

const fetchRTCToken = async (
  channelName: string,
  uid: UID,
  requestConfig: AxiosRequestConfig,
) => {
  if (RTCConfig.serverUrl !== "") {
    try {
      const { data } = await axios.get(
        `${RTCConfig.proxyUrl}${RTCConfig.serverUrl}/api/rtc/${channelName}/publisher/userAccount/${uid}/?expiry=${RTCConfig.tokenExpiryTime}`,
        requestConfig,
      );

      return data;
    } catch (err) {
      console.log(err);

      throw err;
    }
  }

  return RTCConfig.rtcToken;
};

export default fetchRTCToken;
