// src/helpers/cardHelpers.js

export const mapPriorityToBackend = priority => {
  const p = String(priority || '').toLowerCase();
  if (p === 'high') return 'high';
  if (p === 'medium') return 'medium';
  if (p === 'low') return 'low';
  if (p === 'without priority' || p === 'none' || p === 'without') return 'low';
  return 'low';
};

export const mapPriorityToFrontend = priority => {
  const p = String(priority || '').toLowerCase();
  if (['high', 'medium', 'low'].includes(p)) return p;
  if (['none', 'without', 'without priority'].includes(p))
    return 'without priority';
  return 'without priority';
};

// === helper robust pentru date (poți muta în fișier separat dacă vrei)
export const makeValidDate = value => {
  if (value == null || value === '' || value === false) return null;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const ms = value < 1e12 ? value * 1000 : value; // secunde -> ms
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(value); // ISO / string
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Normalizează un card venit din API.
 * Pune dueDate / deadline ca ISO string sau null (nu false/0).
 */
export const normalizeCardFromApi = (apiCard = {}) => {
  const rawDue =
    apiCard?.dueDate ?? apiCard?.deadline ?? apiCard?.due_date ?? null;

  const d = makeValidDate(rawDue);

  return {
    ...apiCard,
    dueDate: d ? d.toISOString() : null,
    deadline: d ? d.toISOString() : null,
    priority: mapPriorityToFrontend(apiCard?.priority),
  };
};

export const normalizeCardsArray = (arr = []) => arr.map(normalizeCardFromApi);

export const toDate = val => makeValidDate(val);

export const formatDDMMYYYY = val => {
  const d = makeValidDate(val);
  if (!d) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const validateCardData = cardInfo => {
  if (!cardInfo.title || !cardInfo.title.trim()) {
    return { isValid: false, error: 'Title is required' };
  }
  if (!cardInfo.description || !cardInfo.description.trim()) {
    return { isValid: false, error: 'Description is required' };
  }
  if (!cardInfo.column) {
    return { isValid: false, error: 'Column is required' };
  }
  return { isValid: true, error: null };
};
