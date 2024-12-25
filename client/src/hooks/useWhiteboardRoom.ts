import { useState, useEffect } from "react";

import useAuth from "./useAuth";
import { useFetchWhiteboardRoomTokenMutation } from "../services/tokenApi";
import showToast from "../utils/showToast";
import type WhiteboardRoomCredentials from "../types/WhiteboardRoomCredentials";

const useWhiteboardRoom = (roomId: string) => {
  const [roomCredentials, setRoomCredentials] =
    useState<WhiteboardRoomCredentials>();
  const [fetchWhiteboardRoomToken] = useFetchWhiteboardRoomTokenMutation();
  const { userId } = useAuth();

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
          showToast("error", "Could not initialize whiteboard");
          console.error("Error initializing whiteboard:", err);
        }
      })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, roomId]);

  return roomCredentials;
};

export default useWhiteboardRoom;
