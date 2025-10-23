import makeValidDate from './makeValidDate';

const isTheDateLessThanNow = value => {
  const d = makeValidDate(value);
  if (!d) return false; // dacă nu e dată validă, nu blocăm submit-ul

  const today = new Date();
  const atMidnight = dt =>
    new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());

  return atMidnight(d) < atMidnight(today);
};

export default isTheDateLessThanNow;
