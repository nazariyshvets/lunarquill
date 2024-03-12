import { AgoraChat } from "agora-chat";

const parseMessage = (message: AgoraChat.MessagesType) =>
  message.type === "txt"
    ? {
        id: message.id,
        type: message.type,
        msg: message.msg,
        senderId: message.from,
        senderUsername: message.ext?.senderUsername,
        recipientId: message.to,
        time: message.time,
      }
    : message.type === "img" ||
        message.type === "audio" ||
        message.type === "video" ||
        message.type === "file"
      ? {
          id: message.id,
          type: message.type,
          file: message.file,
          fileType: message.ext?.fileType,
          fileName: message.ext?.fileName,
          fileSize: message.ext?.fileSize,
          url: message.url,
          senderId: message.from,
          senderUsername: message.ext?.senderUsername,
          recipientId: message.to,
          time: message.time,
        }
      : undefined;

export default parseMessage;
