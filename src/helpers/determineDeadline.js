import makeValidDate from './makeValidDate';

// Doar spune dacă data e astăzi (boolean). NU o folosi pentru afișarea textului datei!
const determineDeadline = date => {
  const d = makeValidDate(date);
  if (!d) return false;

  const today = new Date();
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return d.getTime() === today.getTime();
};

export default determineDeadline;
