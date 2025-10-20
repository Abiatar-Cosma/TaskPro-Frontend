/**
 * Priority mapping
 */
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

/**
 * Normalize un card venit din API.
 * Asigură existența ambelor chei: deadline (UI) și dueDate (API).
 */
export const normalizeCardFromApi = (apiCard = {}) => {
  const due =
    apiCard?.dueDate ?? apiCard?.deadline ?? apiCard?.due_date ?? null;

  return {
    ...apiCard,
    dueDate: due,
    deadline: due,
    priority: mapPriorityToFrontend(apiCard?.priority),
  };
};

export const normalizeCardsArray = (arr = []) => arr.map(normalizeCardFromApi);

/** Utils pentru dată */
export const toDate = val => {
  if (!val) return null;
  const d = val instanceof Date ? val : new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDDMMYYYY = val => {
  const d = toDate(val);
  if (!d) return null;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

/**
 * Validări simple pentru formularul de card
 */
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
