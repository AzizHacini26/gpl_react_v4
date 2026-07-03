import { apiFetch } from './authApi';

const API_URL = '/api/clients';

async function toErrorMessage(response, fallbackMessage) {
  try {
    const text = await response.text();
    if (text) return text;
  } catch {
    // Use fallback message below.
  }
  return fallbackMessage;
}

export const ClientService = {
  getAll: async () => {
    const response = await apiFetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch clients');
    }
    return response.json();
  },

  getById: async (id) => {
    const response = await apiFetch(`${API_URL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch client');
    }
    return response.json();
  },

  create: async (client) => {
    const response = await apiFetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(client),
    });
    if (!response.ok) {
      throw new Error(await toErrorMessage(response, 'Failed to create client'));
    }
    return response.json();
  },

  update: async (id, client) => {
    const response = await apiFetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(client),
    });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(await toErrorMessage(response, 'Failed to update client'));
    }
    return response.json();
  },

  importClients: async (clients) => {
    const response = await apiFetch(`${API_URL}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clients),
    });
    if (!response.ok) {
      throw new Error(await toErrorMessage(response, 'Failed to import clients'));
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
      throw new Error('Failed to delete client');
    }
    return true;
  },
};
