import AC, { AgoraChat } from "agora-chat";

const createChatConnection = () => {
  let connection: AgoraChat.Connection | null = null;

  return () => {
    if (!connection) {
      connection = new AC.connection({
        appKey: import.meta.env.VITE_AGORA_CHAT_APP_KEY.replace(/^"|"$/g, ""),
      });
    }

    return connection as AgoraChat.Connection;
  };
};

const useChatConnection = createChatConnection();

export default useChatConnection;
