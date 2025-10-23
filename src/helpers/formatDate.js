import makeValidDate from './makeValidDate';

// Returnează '—' dacă data lipsește/invalidă; altfel DD/MM/YYYY
const formatDate = input => {
  // Evită 1970: nu parsa falsy/booleeni
  if (
    input === null ||
    input === undefined ||
    input === '' ||
    input === false
  ) {
    return '—';
  }

  const d = makeValidDate(input);
  if (!d) return '—';

  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default formatDate;
