import axios, { AxiosRequestConfig } from "axios";

import RTMConfig from "../config/RTMConfig";

const fetchRTMToken = async (
  uid: string,
  requestConfig: AxiosRequestConfig,
) => {
  if (RTMConfig.serverUrl !== "" && uid) {
    try {
      const { data } = await axios.get(
        `${RTMConfig.proxyUrl}${RTMConfig.serverUrl}/api/rtm/${uid}/?expiry=${RTMConfig.tokenExpiryTime}`,
        requestConfig,
      );

      return data;
    } catch (err) {
      console.log(err);

      throw err;
    }
  }

  return RTMConfig.rtmToken;
};

export default fetchRTMToken;
