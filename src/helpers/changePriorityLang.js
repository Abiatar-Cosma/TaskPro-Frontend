// Mapare prietenoasă pentru afișare/consum
// (dacă ai i18n, poți înlocui cu traduceri reale)
export default function changePriorityLang(priority) {
  if (!priority) return 'without priority';
  const p = String(priority).toLowerCase();

  if (p === 'without' || p === 'without priority' || p === 'none') {
    return 'without priority';
  }
  if (p === 'low') return 'low';
  if (p === 'medium') return 'medium';
  if (p === 'high') return 'high';

  // fallback
  return 'low';
}
