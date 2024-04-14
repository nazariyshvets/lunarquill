import { useEffect } from "react";

import { AgoraChat } from "agora-chat";

import useAuthRequestConfig from "./useAuthRequestConfig";
import fetchChatToken from "../utils/fetchChatToken";
import ChatConfig from "../config/ChatConfig";

const useChatTokenWillExpire = (connection: AgoraChat.Connection) => {
  const requestConfig = useAuthRequestConfig();

  useEffect(() => {
    connection.addEventHandler("connection", {
      onTokenWillExpire: async () => {
        try {
          const token = await fetchChatToken(ChatConfig.uid, requestConfig);

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
  }, [connection, requestConfig]);
};

export default useChatTokenWillExpire;
