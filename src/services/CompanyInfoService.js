import { apiFetch } from './authApi';

const API_URL = '/api/company-info';

export const CompanyInfoService = {
  getAll: async () => {
    const response = await apiFetch(API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch company info (HTTP ${response.status})`);
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

  create: async (company) => {
    const response = await apiFetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(company),
    });
    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('You already have a company info record');
      }
      throw new Error('Failed to create company info');
    }
    return response.json();
  },

  update: async (id, company) => {
    const response = await apiFetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(company),
    });
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('You can only update your own company info');
      }
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to update company info');
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
      throw new Error('Failed to delete company info');
    }
    return true;
  },
};
