const inrWhole = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrExact = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const inrCompact = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const shortDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const longDate = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** ₹22,500 — or ₹2,222.10 when there are paise. */
export function formatINR(value) {
  const amount = Number(value) || 0;
  return (Number.isInteger(amount) ? inrWhole : inrExact).format(amount);
}

/** ₹12K, ₹4.5L, ₹1.2Cr — for chart axes. */
export const formatINRCompact = (value) => inrCompact.format(Number(value) || 0);

/** Local calendar date as YYYY-MM-DD (the format stored in Firestore). */
export function toISODate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(iso, days) {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export const formatDate = (iso) => (iso ? shortDate.format(parseISODate(iso)) : '—');

export const formatLongDate = (date) => longDate.format(date);

export const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
