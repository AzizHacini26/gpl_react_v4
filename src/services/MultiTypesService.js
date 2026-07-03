import { apiFetch } from './authApi';

const API_URL = '/api/multitypes';

export const MultiTypesService = {
  getAll: async () => {
    const response = await apiFetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch multitypes');
    }
    return response.json();
  },

  getById: async (id) => {
    const response = await apiFetch(`${API_URL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch multitype');
    }
    return response.json();
  },

   getAllByType: async (type) => {
    const response = await apiFetch(`${API_URL}/type/${type}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch multitype');
    }
    return response.json();
  },

  create: async (multiType) => {
    const response = await apiFetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(multiType),
    });
    if (!response.ok) {
      throw new Error('Failed to create multitype');
    }
    return response.json();
  },

  update: async (id, multiType) => {
    const response = await apiFetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(multiType),
    });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to update multitype');
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
      throw new Error('Failed to delete multitype');
    }
    return true;
  },
};
