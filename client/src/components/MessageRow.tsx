import { AgoraChat } from "agora-chat";
import TextMessage from "./TextMessage";
import AudioMessage from "./AudioMessage";
import ImageMessage from "./ImageMessage";
import formatTime from "../utils/formatTime";
import type Message from "../types/Message";

interface MessageRowProps {
  message: Message;
  displayUsername?: boolean;
  isLocalUser?: boolean;
}

const MessageRow = ({
  message,
  displayUsername = false,
  isLocalUser = false,
}: MessageRowProps) => {
  const getMessageWidget = () => {
    switch (message.type) {
      case "txt":
        return (
          <TextMessage
            message={message.msg as string}
            isLocalUser={isLocalUser}
          />
        );
      case "audio":
        return <AudioMessage audio={message.msg as AgoraChat.FileObj} />;
      case "img":
        return <ImageMessage url={message.msg as string} />;
      default:
        return <></>;
    }
  };

  return (
    <div
      className={`flex max-w-full flex-col gap-1 rounded bg-charcoal py-1 ${
        isLocalUser
          ? "items-end pl-2 pr-6 outline outline-1 outline-lightgrey"
          : "pl-6 pr-2"
      }`}
    >
      {displayUsername && (
        <span className="truncate text-sm font-medium tracking-wider text-primary-light sm:text-base">
          {isLocalUser ? "You" : message.senderUsername ?? "Unknown"}
        </span>
      )}

      <div
        className={`flex max-w-full items-end gap-2 sm:gap-4 ${
          isLocalUser ? "flex-row-reverse" : ""
        }`}
      >
        {getMessageWidget()}
        <i className="text-lightgrey text-2xs sm:text-xs">
          {formatTime(message.time)}
        </i>
      </div>
    </div>
  );
};

export default MessageRow;
