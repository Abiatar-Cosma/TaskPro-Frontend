const determineDeadline = date => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return d.getTime() === today.getTime();
};

export default determineDeadline;
