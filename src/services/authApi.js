const TOKEN_KEY = 'authToken';

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
  return atob(padded);
}

export function getTokenClaims() {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(parts[1]));
  } catch {
    return null;
  }
}

export function getUserPermissions() {
  const claims = getTokenClaims();
  const permissions = claims?.permissions;
  if (!Array.isArray(permissions)) {
    return [];
  }
  return permissions.filter((item) => typeof item === 'string');
}

export function hasPermission(permissionName) {
  if (!permissionName) {
    return true;
  }
  return getUserPermissions().includes(permissionName);
}

export function clearAuth() {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('authToken');
  localStorage.removeItem('username');
}

export async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getAuthToken();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuth();
  }

  return response;
}
