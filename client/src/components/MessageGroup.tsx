import MessageRow from "./MessageRow";
import type { GroupedMessage } from "../utils/groupMessages";

interface MessageGroupProps extends GroupedMessage {
  isLocalUser?: boolean;
}

const MessageGroup = ({
  messages,
  displayDate,
  isLocalUser = false,
}: MessageGroupProps) => {
  return (
    <div className="flex flex-col gap-4">
      {displayDate && (
        <span className="truncate text-center text-sm text-lightgrey sm:text-base">
          {displayDate}
        </span>
      )}

      <div
        className={`flex max-w-[calc(100%-2.25rem)] ${
          isLocalUser ? "flex-row-reverse self-end" : ""
        }`}
      >
        <div className="relative h-12 w-12 flex-shrink-0 rounded-full border-4 border-deep-black bg-primary-light"></div>
        <div
          className={`flex max-w-full flex-col gap-1 ${
            isLocalUser ? "-mr-4 items-end" : "-ml-4 items-start"
          }`}
        >
          {messages.map((message, i) => (
            <MessageRow
              key={message.id}
              message={message}
              isLocalUser={isLocalUser}
              displayUsername={i === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageGroup;
