import dayjs from 'dayjs';

export function formatDateShort(value: string | null, fallback = '—') {
  if (!value) return fallback;
  return dayjs(value).format('MMM D, YYYY');
}

export function formatDateTime(value?: string | null, fallback = '-') {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toLocaleString();
}
