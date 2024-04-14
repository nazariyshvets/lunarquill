import { AgoraChat } from "agora-chat";

interface Message {
  id: string;
  type: AgoraChat.MessageType;
  msg?: string;
  file?: AgoraChat.FileObj;
  fileType?: string;
  fileName?: string;
  fileSize?: number;
  url?: string;
  senderId?: string;
  senderUsername?: string;
  recipientId: string;
  time: number;
  reactions?: AgoraChat.Reaction[];
}

export default Message;
