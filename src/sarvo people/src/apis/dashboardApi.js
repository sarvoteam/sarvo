import { api } from './client';

export const dashboardApi = {
  getAdminMetrics: async () => {
    return await api.get('/dashboard/admin-metrics');
  }
};
