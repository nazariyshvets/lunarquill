const getWeek = (date: Date) => {
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const diffMilliseconds = date.getTime() - yearStart.getTime();

  return Math.ceil(diffMilliseconds / (7 * 24 * 60 * 60 * 1000));
};

export default getWeek;
