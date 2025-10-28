// src/helpers/compareDates.js
function compareDates(date1, date2) {
  if (!date1 || !date2) return false;
  const a = date1 instanceof Date ? date1 : new Date(date1);
  const b = date2 instanceof Date ? date2 : new Date(date2);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return false;
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return a.getTime() === b.getTime();
}
export default compareDates;
