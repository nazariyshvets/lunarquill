import { useState, useEffect } from "react";
import { useAlert } from "react-alert";

import useAuthRequestConfig from "../hooks/useAuthRequestConfig";
import useAuth from "./useAuth";
import fetchWhiteboardRoomToken from "../utils/fetchWhiteboardRoomToken";
import type WhiteboardRoomCredentials from "../types/WhiteboardRoomCredentials";

const useWhiteboardRoom = (roomId: string) => {
  const [roomCredentials, setRoomCredentials] =
    useState<WhiteboardRoomCredentials>();
  const { userId } = useAuth();
  const authRequestConfig = useAuthRequestConfig();
  const alert = useAlert();

  useEffect(() => {
    if (!roomCredentials && userId && roomId)
      (async () => {
        try {
          const roomToken = await fetchWhiteboardRoomToken(
            roomId,
            authRequestConfig,
          );

          setRoomCredentials({
            uid: userId ?? "",
            uuid: roomId,
            roomToken,
          });
        } catch (err) {
          alert.error("Could not initialize whiteboard");
          console.log(err);
        }
      })();
  }, [roomCredentials, alert, authRequestConfig, userId, roomId]);

  return roomCredentials;
};

export default useWhiteboardRoom;
