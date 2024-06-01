import { useEffect } from "react";

import { AgoraChat } from "agora-chat";

import useAuth from "./useAuth";
import useAuthRequestConfig from "./useAuthRequestConfig";
import fetchChatToken from "../utils/fetchChatToken";
import ChatConfig from "../config/ChatConfig";

const useChatTokenWillExpire = (connection: AgoraChat.Connection) => {
  const { userId } = useAuth();
  const requestConfig = useAuthRequestConfig();

  useEffect(() => {
    connection.addEventHandler("connection", {
      onTokenWillExpire: async () => {
        try {
          const token = await fetchChatToken(userId ?? "", requestConfig);

          ChatConfig.token = token;
          connection.token = token;
        } catch (err) {
          console.log(err);
        }
      },
    });

    return () => {
      connection.removeEventHandler("connection");
    };
  }, [connection, requestConfig, userId]);
};

export default useChatTokenWillExpire;
