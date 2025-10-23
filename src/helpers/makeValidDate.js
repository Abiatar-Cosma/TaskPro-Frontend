// Acceptă ISO, milisecunde sau secunde UNIX; întoarce Date valid sau null
const makeValidDate = value => {
  if (value == null || value === '' || value === false) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    // dacă pare secunde UNIX, convertește la ms
    const ms = value < 1e12 ? value * 1000 : value;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(value); // ISO/string
  return Number.isNaN(d.getTime()) ? null : d;
};

export default makeValidDate;
