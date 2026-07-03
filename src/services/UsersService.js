import { apiFetch } from './authApi';

const API_URL = '/api/users';

export const UsersService = {
  getCurrent: async () => {
    const response = await apiFetch(`${API_URL}/me`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch current user');
    }
    return response.json();
  },

  getAll: async () => {
    const response = await apiFetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  }, 

  loginuser: async (username, password) => {
    const response = await fetch('/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      if (response.status === 401) {
        return null; // Invalid credentials
      }
      throw new Error('Failed to login');
    }
    return response.json();
  },
  
  getById: async (id) => {
    const response = await apiFetch(`${API_URL}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch user');
    }
    return response.json();
   },

  create: async (user) => {
    const response = await apiFetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    return response.json();
  },

  update: async (id, user) => {
    const response = await apiFetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to update user');
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
      throw new Error('Failed to delete user');
    }
    return true;
  },
};
