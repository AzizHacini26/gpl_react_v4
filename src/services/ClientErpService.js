import { apiFetch } from './authApi';

const API_URL = '/api/clients/erp';

export const ClientErpService = {
  getAll: async () => {
    const response = await apiFetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch ERP clients');
    }
    return response.json();
  },

  getById: async (id) => {
    const response = await apiFetch(`${API_URL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch ERP client');
    }
    return response.json();
  },

  search: async (q) => {
    const response = await apiFetch(`${API_URL}/search?q=${encodeURIComponent(q)}`);
    if (!response.ok) {
      throw new Error('Failed to search ERP clients');
    }
    return response.json();
  },

  create: async (client) => {
    const response = await apiFetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    if (!response.ok) {
      throw new Error('Failed to create ERP client');
    }
    return response.json();
  },
};
