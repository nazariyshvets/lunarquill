import { useState, useEffect } from "react";
import { useAlert } from "react-alert";

import useAuth from "./useAuth";
import { useFetchWhiteboardRoomTokenMutation } from "../services/tokenApi";
import type WhiteboardRoomCredentials from "../types/WhiteboardRoomCredentials";

const useWhiteboardRoom = (roomId: string) => {
  const [roomCredentials, setRoomCredentials] =
    useState<WhiteboardRoomCredentials>();
  const [fetchWhiteboardRoomToken] = useFetchWhiteboardRoomTokenMutation();
  const { userId } = useAuth();
  const alert = useAlert();

  useEffect(() => {
    if (userId && roomId)
      (async () => {
        try {
          const { token: roomToken } =
            await fetchWhiteboardRoomToken(roomId).unwrap();

          setRoomCredentials({
            uid: userId,
            uuid: roomId,
            roomToken,
          });
        } catch (err) {
          alert.error("Could not initialize whiteboard");
          console.error("Error initializing whiteboard:", err);
        }
      })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, roomId]);

  return roomCredentials;
};

export default useWhiteboardRoom;
