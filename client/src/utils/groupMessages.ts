import formatDate from "./formatDate";
import type Message from "../types/Message";

interface GroupedMessage {
  id: string;
  messages: Message[];
  displayDate?: string;
}

const groupMessages = (messages: Message[]) => {
  if (messages.length === 0) return [];

  const groups: GroupedMessage[] = [];
  const firstMessage = messages[0];
  const displayDate = formatDate(firstMessage.time);
  let currentGroup: GroupedMessage = {
    id: firstMessage.id,
    messages: [firstMessage],
    displayDate,
  };
  const seenDates = new Set([displayDate]);

  for (let i = 1; i < messages.length; i++) {
    const currentMessage = messages[i];
    const prevMessage = messages[i - 1];

    const currentDate = formatDate(currentMessage.time);
    const prevDate = formatDate(prevMessage.time);

    const isSameUser =
      !!currentMessage.senderId &&
      !!prevMessage.senderId &&
      currentMessage.senderId === prevMessage.senderId;
    const isSameDay = currentDate === prevDate;

    if (isSameUser && isSameDay) {
      currentGroup.messages.push(currentMessage);
    } else {
      groups.push(currentGroup);
      currentGroup = {
        id: currentMessage.id,
        messages: [currentMessage],
        displayDate: seenDates.has(currentDate) ? undefined : currentDate,
      };
      seenDates.add(currentDate);
    }
  }

  groups.push(currentGroup);

  return groups;
};

export default groupMessages;
export type { GroupedMessage };
