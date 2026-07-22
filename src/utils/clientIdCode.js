const PRODUCT_YEAR_STORAGE_KEY = 'productYear';
const IDCODE_PATTERN = /^\d{4}-\d+$/;

export function getSelectedProductYear() {
  const currentYear = new Date().getFullYear();
  const savedYear = localStorage.getItem(PRODUCT_YEAR_STORAGE_KEY);
  const parsed = Number(savedYear);
  return Number.isFinite(parsed) ? parsed : currentYear;
}

export function normalizeIdCode(value) {
  return String(value || '').trim();
}

export function isValidIdCodeFormat(value) {
  return IDCODE_PATTERN.test(normalizeIdCode(value));
}

export function generateNextClientIdCode(clients, year) {
  const yearText = String(year);
  let maxSequence = 0;

  (clients || []).forEach((client) => {
    const normalized = normalizeIdCode(client?.idcode);
    if (!normalized) return;

    const [clientYear, sequenceText] = normalized.split('-');
    if (clientYear !== yearText) return;

    const sequence = Number.parseInt(sequenceText, 10);
    if (Number.isFinite(sequence) && sequence > maxSequence) {
      maxSequence = sequence;
    }
  });

  return `${yearText}-${maxSequence + 1}`;
}

export function hasDuplicateIdCode(clients, idcode, currentClientId = null) {
  const normalizedTarget = normalizeIdCode(idcode);
  if (!normalizedTarget) return false;

  return (clients || []).some((client) => {
    if (currentClientId != null && client?.id === currentClientId) return false;
    return normalizeIdCode(client?.idcode) === normalizedTarget;
  });
}
