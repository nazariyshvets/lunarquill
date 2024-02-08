import { AgoraChat } from "agora-chat";

interface Message {
  id: string;
  type: AgoraChat.MessageType;
  msg: string | AgoraChat.FileObj;
  senderId?: string;
  senderUsername?: string;
  recipientId: string;
  time: number;
}

export default Message;
