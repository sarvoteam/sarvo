import { api } from './client';

export const leaveApi = {
  getBalances: async (employeeId = null) => {
    const query = employeeId ? `?employeeId=${employeeId}` : '';
    return await api.get(`/leaves/balances${query}`);
  },
  getTypes: async () => {
    return await api.get('/leaves/types');
  },
  applyLeave: async (leaveData) => {
    return await api.post('/leaves/apply', leaveData);
  },
  listApplications: async (employeeId = null) => {
    const query = employeeId ? `?employeeId=${employeeId}` : '';
    return await api.get(`/leaves/applications${query}`);
  },
  updateStatus: async (applicationId, status, remarks = '') => {
    return await api.put(`/leaves/applications/${applicationId}`, { status, remarks });
  }
};
