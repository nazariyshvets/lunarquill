import getWeek from "./getWeek";

const formatDate = (timestamp: number) => {
  const messageDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  const optionsSameYear = { month: "short", day: "numeric" } as const;
  const optionsDifferentYear = {
    year: "numeric",
    month: "short",
    day: "numeric",
  } as const;
  const optionsSameWeek = { weekday: "long" } as const;

  yesterday.setDate(today.getDate() - 1);

  if (
    messageDate.getDate() === today.getDate() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getFullYear() === today.getFullYear()
  ) {
    return "Today";
  } else if (
    messageDate.getDate() === yesterday.getDate() &&
    messageDate.getMonth() === yesterday.getMonth() &&
    messageDate.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  } else if (
    messageDate.getFullYear() === today.getFullYear() &&
    getWeek(messageDate) === getWeek(today)
  ) {
    return messageDate.toLocaleDateString("en-US", optionsSameWeek);
  } else if (messageDate.getFullYear() === today.getFullYear()) {
    return messageDate.toLocaleDateString("en-US", optionsSameYear);
  } else {
    return messageDate.toLocaleDateString("en-US", optionsDifferentYear);
  }
};

export default formatDate;
