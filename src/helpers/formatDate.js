const formatDate = input => {
  const date = input instanceof Date ? input : new Date(input);
  if (!date || Number.isNaN(date.getTime())) return '—';

  let day = date.getDate();
  let month = date.getMonth() + 1;
  const year = date.getFullYear();

  if (month < 10 || day < 10) {
    month = String(month).padStart(2, '0');
    day = String(day).padStart(2, '0');
  }

  return `${day}/${month}/${year}`;
};

export default formatDate;
