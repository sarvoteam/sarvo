import { api } from './client';

export const dailyReportApi = {
  getReports: async (myOwn = false) => {
    const query = myOwn ? '?myOwn=true' : '';
    return await api.get(`/daily-reports${query}`);
  },
  submitReport: async (reportData) => {
    return await api.post('/daily-reports', reportData);
  },
  commentReport: async (reportId, commentData) => {
    return await api.post(`/daily-reports/comment/${reportId}`, commentData);
  }
};
