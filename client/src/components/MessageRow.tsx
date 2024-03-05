import TextMessage from "./TextMessage";
import AudioMessage from "./AudioMessage";
import ImageVideoMessage from "./ImageVideoMessage";
import FileMessage from "./FileMessage";
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
          message.msg && (
            <TextMessage message={message.msg} isLocalUser={isLocalUser} />
          )
        );
      case "audio":
        return (
          message.url &&
          message.fileName && (
            <AudioMessage url={message.url} fileName={message.fileName} />
          )
        );
      case "img":
        return (
          message.url && <ImageVideoMessage type="img" url={message.url} />
        );
      case "video":
        return (
          message.url && <ImageVideoMessage type="video" url={message.url} />
        );
      case "file":
        return (
          message.url &&
          message.fileType && (
            <FileMessage
              url={message.url}
              fileType={message.fileType}
              fileName={message.fileName}
              fileSize={message.fileSize}
            />
          )
        );
      default:
        return;
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
