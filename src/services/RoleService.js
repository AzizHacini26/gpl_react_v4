import { apiFetch } from './authApi';

const API_URL = '/api/roles';

export const RoleService = {
  getAll: async () => {
    const response = await apiFetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch roles');
    }
    return response.json();
  }, 
  
  getById: async (id) => {
    const response = await apiFetch(`${API_URL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch role');
    }
    return response.json();
   },

  create: async (role) => {
    const response = await apiFetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(role),
    });
    if (!response.ok) {
      throw new Error('Failed to create role');
    }
    return response.json();
  },

  update: async (id, role) => {
    const response = await apiFetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(role),
    });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to update role');
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
      throw new Error('Failed to delete role');
    }
    return true;
  },
};
