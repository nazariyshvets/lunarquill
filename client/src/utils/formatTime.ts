const formatTime = (timestamp: number) => {
  const options = { hour: "2-digit", minute: "2-digit" } as const;
  return new Date(timestamp).toLocaleTimeString([], options);
};

export default formatTime;
