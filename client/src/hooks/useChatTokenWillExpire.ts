import { useEffect } from "react";

import { AgoraChat } from "agora-chat";

import showToast from "../utils/showToast";

import useAuth from "./useAuth";
import { useFetchChatTokenMutation } from "../services/tokenApi";

const useChatTokenWillExpire = (connection: AgoraChat.Connection) => {
  const { userId } = useAuth();
  const [fetchChatToken] = useFetchChatTokenMutation();

  useEffect(() => {
    connection.addEventHandler("connection", {
      onTokenWillExpire: async () => {
        if (!userId) return;

        try {
          connection.token = await fetchChatToken(userId).unwrap();
        } catch (err) {
          showToast("error", "Could not renew chat token");
          console.error("Error renewing chat token:", err);
        }
      },
    });

    return () => {
      connection.removeEventHandler("connection");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
};

export default useChatTokenWillExpire;
