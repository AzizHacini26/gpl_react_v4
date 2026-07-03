import { apiFetch } from './authApi';

const API_URL = '/api/debts';

async function toErrorMessage(response, fallbackMessage) {
  try {
    const text = await response.text();
    if (text) return text;
  } catch {
    // ignore
  }
  return fallbackMessage;
}

export const DebtsService = {
  getAll: async () => {
    const response = await apiFetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch debts');
    }
    return response.json();
  },

  create: async (debt) => {
    const response = await apiFetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(debt),
    });
    if (!response.ok) {
      throw new Error(await toErrorMessage(response, 'Failed to create debt'));
    }
    return response.json();
  },

  update: async (id, debt) => {
    const response = await apiFetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(debt),
    });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(await toErrorMessage(response, 'Failed to update debt'));
    }
    return response.json();
  },

  delete: async (id) => {
    const response = await apiFetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      if (response.status === 404) {
        return false;
      }
      throw new Error('Failed to delete debt');
    }
    return true;
  },
};
