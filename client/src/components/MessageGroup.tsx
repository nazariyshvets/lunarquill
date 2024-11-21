import MessageRow from "./MessageRow";
import useAvatarSource from "../hooks/useAvatarSource";
import type { GroupedMessage } from "../utils/groupMessages";

interface MessageGroupProps extends GroupedMessage {
  isLocalUser?: boolean;
  onReactionClick: (messageId: string, emojiUnified?: string) => Promise<void>;
}

const MessageGroup = ({
  messages,
  displayDate,
  isLocalUser = false,
  onReactionClick,
}: MessageGroupProps) => {
  const avatarSrc = useAvatarSource(messages[0]?.senderAvatarId);

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
        <div className="relative z-[1] h-12 w-12 flex-shrink-0 rounded-full border-4 border-deep-black">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              className="h-full w-full rounded-full object-cover"
              draggable={false}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-full bg-primary-light">
              {(isLocalUser ? "You" : messages[0]?.senderUsername ?? "Unknown")
                .slice(0, 2)
                .toUpperCase()}
            </span>
          )}
        </div>
        <div
          className={`flex max-w-full flex-col gap-2 ${
            isLocalUser ? "-mr-4 items-end" : "-ml-4 items-start"
          }`}
        >
          {messages.map((message, i) => (
            <MessageRow
              key={message.id}
              message={message}
              isLocalUser={isLocalUser}
              displayUsername={i === 0}
              onReactionClick={(emojiUnified?: string) =>
                onReactionClick(message.id, emojiUnified)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageGroup;
