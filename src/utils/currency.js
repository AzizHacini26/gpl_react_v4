const DZD_SUFFIX = 'دج';

export function parseAmount(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const normalized = String(value).replace(/[^\d.,-]/g, '').replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatDZD(value, options = {}) {
  const { showSuffix = true, fallback = '-' } = options;
  const amount = parseAmount(value);

  if (amount === 0 && (value === null || value === undefined || value === '')) {
    return fallback;
  }

  const formatted = Math.round(amount).toLocaleString('en-US');
  return showSuffix ? `${formatted} ${DZD_SUFFIX}` : formatted;
}
