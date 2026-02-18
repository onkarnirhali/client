export function safeText(value?: string | null, fallback = '-') {
  if (!value) return fallback;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : fallback;
}
