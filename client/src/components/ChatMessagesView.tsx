import { useRef, useEffect, memo } from "react";

import _ from "lodash";

import MessageGroup from "./MessageGroup";
import useAuth from "../hooks/useAuth";
import type { GroupedMessage } from "../utils/groupMessages";
import { UserWithoutPassword } from "../types/User";

interface ChatMessagesViewProps {
  messageGroups: GroupedMessage[];
  members: UserWithoutPassword[];
  onReactionClick: (messageId: string, emojiUnified?: string) => Promise<void>;
  onScroll: () => Promise<void>;
}

const ChatMessagesView = ({
  messageGroups,
  members,
  onReactionClick,
  onScroll,
}: ChatMessagesViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { userId } = useAuth();

  useEffect(() => {
    const container = containerRef.current;

    const handleMessagesContainerScroll = _.debounce(async () => {
      if (container && container.scrollTop <= 100) {
        await onScroll();
      }
    }, 200);

    container?.addEventListener("scroll", handleMessagesContainerScroll);

    return () => {
      container?.removeEventListener("scroll", handleMessagesContainerScroll);
    };
  }, [onScroll]);

  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messageGroups]);

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-col gap-4 overflow-auto px-1 py-2 sm:px-2 sm:py-3"
    >
      {messageGroups.map((group) => (
        <MessageGroup
          key={group.id}
          {...group}
          isLocalUser={group.messages.at(0)?.senderId === userId}
          chatMembers={members}
          onReactionClick={onReactionClick}
        />
      ))}
    </div>
  );
};

const MemoizedChatMessagesView = memo(ChatMessagesView);

export default MemoizedChatMessagesView;
