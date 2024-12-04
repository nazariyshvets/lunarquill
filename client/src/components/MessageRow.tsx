import { BiSmile } from "react-icons/bi";

import TextMessage from "./TextMessage";
import AudioMessage from "./AudioMessage";
import ImageVideoMessage from "./ImageVideoMessage";
import FileMessage from "./FileMessage";
import SimpleButton from "./SimpleButton";
import useAuth from "../hooks/useAuth";
import formatTime from "../utils/formatTime";
import type Message from "../types/Message";

interface MessageRowProps {
  message: Message;
  displayUsername?: boolean;
  isLocalUser?: boolean;
  onReactionClick: (emojiUnified?: string) => Promise<void>;
}

const MessageRow = ({
  message,
  displayUsername = false,
  isLocalUser = false,
  onReactionClick,
}: MessageRowProps) => {
  const { userId } = useAuth();

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
    <div className={`flex flex-col gap-1 ${isLocalUser ? "items-end" : ""}`}>
      <div
        className={`group relative flex flex-col gap-1 rounded bg-charcoal py-1 ${
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

        <SimpleButton
          className={`absolute bottom-0 hidden group-hover:inline-block ${
            isLocalUser ? "right-full" : "left-full"
          }`}
          onClick={() => onReactionClick()}
        >
          <BiSmile className="text-lg sm:text-xl" />
        </SimpleButton>
      </div>

      {!!message.reactions?.length && (
        <div className="flex items-center gap-1">
          {message.reactions.map(
            (reaction) =>
              reaction.count > 0 && (
                <div
                  key={reaction.reaction}
                  className={`flex cursor-pointer items-center gap-1 rounded-full px-1 text-sm outline outline-1 sm:text-base ${
                    reaction.userList.find((uid) => uid === userId)
                      ? "bg-charcoal outline-primary-light"
                      : "outline-lightgrey"
                  }`}
                  onClick={() => onReactionClick(reaction.reaction)}
                >
                  <span role="img">
                    {String.fromCodePoint(parseInt(reaction.reaction, 16))}
                  </span>
                  <span className="text-primary-light">{reaction.count}</span>
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );
};

export default MessageRow;
