import { apiFetch } from './authApi';

const API_URL = '/api/audit-logs';

export const AuditService = {
  getMyLogs: async () => {
    const res = await apiFetch(API_URL);
    if (!res.ok) {
      throw new Error('Failed to fetch audit logs');
    }
    return res.json();
  },
};
