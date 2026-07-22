import { apiFetch } from './authApi';

const API_URL = '/api/template-settings';

export const TemplateSettingsService = {
  getDocumentTypes: async () => {
    const response = await apiFetch(`${API_URL}/document-types`);
    if (!response.ok) {
      throw new Error('Failed to fetch document types');
    }
    return response.json();
  },

  getTemplatesByDocumentType: async (documentTypeCode) => {
    const query = new URLSearchParams({ documentTypeCode }).toString();
    const response = await apiFetch(`${API_URL}/templates?${query}`);
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    return response.json();
  },

  getMySelections: async () => {
    const response = await apiFetch(`${API_URL}/my-selections`);
    if (!response.ok) {
      throw new Error('Failed to fetch selections');
    }
    return response.json();
  },

  saveMySelections: async (selections) => {
    const response = await apiFetch(`${API_URL}/my-selections`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selections),
    });
    if (!response.ok) {
      const message = await response.text().catch(() => '');
      throw new Error(message || 'Failed to save selections');
    }
    return response.json();
  },

  createCustomTemplate: async (payload) => {
    const response = await apiFetch(`${API_URL}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const message = await response.text().catch(() => '');
      throw new Error(message || 'Failed to create template');
    }
    return response.json();
  },

  getTemplateImageUrl: (id) => `${API_URL}/templates/${id}/image`,

  fetchTemplateImageBlob: async (id) => {
    const response = await apiFetch(`${API_URL}/templates/${id}/image`);
    if (!response.ok) return null;
    return response.blob();
  },

  uploadTemplateImage: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiFetch(`${API_URL}/templates/${id}/image`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const message = await response.text().catch(() => '');
      throw new Error(message || 'Failed to upload image');
    }
  },
};
