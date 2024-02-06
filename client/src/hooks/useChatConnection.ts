import AC, { AgoraChat } from "agora-chat";

const createChatConnection = () => {
  let connection: AgoraChat.Connection | null = null;

  const useChatConnection = () => {
    if (!connection) {
      connection = new AC.connection({
        appKey: import.meta.env.VITE_AGORA_CHAT_APP_KEY,
      });
    }

    return connection as AgoraChat.Connection;
  };

  return useChatConnection;
};

const useChatConnection = createChatConnection();

export default useChatConnection;
