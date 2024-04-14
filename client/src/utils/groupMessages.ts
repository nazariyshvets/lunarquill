import { nanoid } from "@reduxjs/toolkit";

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
  let currentGroup: GroupedMessage = {
    id: nanoid(),
    messages: [messages[0]],
    displayDate: formatDate(messages[0].time),
  };
  const seenDates: Set<string> = new Set([formatDate(messages[0].time)]);

  for (let i = 1; i < messages.length; i++) {
    const currentMessage = messages[i];
    const prevMessage = messages[i - 1];

    const currentDate = formatDate(currentMessage.time);
    const prevDate = formatDate(prevMessage.time);

    const isSameUser =
      currentMessage.senderId &&
      prevMessage.senderId &&
      currentMessage.senderId === prevMessage.senderId;
    const isSameDay = currentDate === prevDate;

    if (isSameUser && isSameDay) {
      currentGroup.messages.push(currentMessage);
    } else {
      groups.push(currentGroup);
      currentGroup = {
        id: nanoid(),
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
