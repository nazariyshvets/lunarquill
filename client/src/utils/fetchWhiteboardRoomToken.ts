import axios, { AxiosRequestConfig } from "axios";

import RTCConfig from "../config/RTCConfig";

const fetchWhiteboardRoomToken = async (
  roomId: string,
  requestConfig: AxiosRequestConfig,
) => {
  if (RTCConfig.serverUrl) {
    try {
      const { data } = await axios.get(
        `${RTCConfig.proxyUrl}${RTCConfig.serverUrl}/api/whiteboard/room-token/${roomId}`,
        requestConfig,
      );

      return data.token;
    } catch (err) {
      console.log(err);

      throw err;
    }
  }

  throw new Error("Server url is not provided");
};

export default fetchWhiteboardRoomToken;
