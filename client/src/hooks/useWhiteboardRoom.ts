import { useState, useEffect } from "react";
import { useAlert } from "react-alert";
// import axios from "axios";

import useAuthRequestConfig from "../hooks/useAuthRequestConfig";
// import fetchWhiteboardSdkToken from "../utils/fetchWhiteboardSdkToken";
import fetchWhiteboardRoomToken from "../utils/fetchWhiteboardRoomToken";
import RTCConfig from "../config/RTCConfig";
import type WhiteboardRoomCredentials from "../types/WhiteboardRoomCredentials";

const useWhiteboardRoom = () => {
  const [roomCredentials, setRoomCredentials] =
    useState<WhiteboardRoomCredentials>();
  const authRequestConfig = useAuthRequestConfig();
  const alert = useAlert();

  useEffect(() => {
    const init = async () => {
      try {
        // ===== CREATE ROOM =====
        // const sdkToken = await fetchWhiteboardSdkToken(authRequestConfig);
        // const { data: roomData } = await axios.post(
        //   `${RTCConfig.proxyUrl}${RTCConfig.serverUrl}/api/whiteboard/room`,
        //   {
        //     sdkToken,
        //   },
        //   authRequestConfig,
        // );
        // const roomId = JSON.parse(roomData).uuid;

        const roomId = "834ed5d00acd11efb1ead1666c84cc83";
        const roomToken = await fetchWhiteboardRoomToken(
          roomId,
          authRequestConfig,
        );

        setRoomCredentials({
          uid: RTCConfig.uid.toString(),
          uuid: roomId,
          roomToken,
        });
      } catch (err) {
        alert.error("Could not initialize whiteboard");
        console.log(err);
      }
    };

    if (!roomCredentials) init();
  }, [roomCredentials, alert, authRequestConfig]);

  return roomCredentials;
};

export default useWhiteboardRoom;
