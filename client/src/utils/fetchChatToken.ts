import axios, { AxiosRequestConfig } from "axios";

import ChatConfig from "../config/ChatConfig";

const fetchChatToken = async (
  uid: string,
  requestConfig: AxiosRequestConfig,
) => {
  if (ChatConfig.serverUrl !== "") {
    try {
      const { data } = await axios.get(
        `${ChatConfig.serverUrl}/api/chat/${uid}/${ChatConfig.tokenExpiryTime}`,
        requestConfig,
      );

      return data;
    } catch (err) {
      console.log(err);

      throw err;
    }
  }

  return ChatConfig.token;
};

export default fetchChatToken;
