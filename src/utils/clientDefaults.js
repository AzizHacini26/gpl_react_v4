const STORAGE_KEY = 'clientDefaults';

const DEFAULT_KEYS = [
  'mcarmarqueT',
  'mbatteltypeT',
  'msizeT',
  'mdaysT',
  'mcartypeT',
  'mstateT',
  'mdomicileT',
  'mdocT',
];

export function loadClientDefaults() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveClientDefaults(defaults) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
}

export function getClientDefaultFormValues() {
  const defaults = loadClientDefaults();
  const result = {};
  DEFAULT_KEYS.forEach((key) => {
    result[key] = defaults[key] || null;
  });
  return result;
}
