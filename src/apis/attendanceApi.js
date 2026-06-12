import { api } from './client';

export const attendanceApi = {
  checkIn: async () => {
    return await api.post('/attendance/checkin', {});
  },
  checkOut: async () => {
    return await api.post('/attendance/checkout', {});
  },
  getTodayStatus: async () => {
    return await api.get('/attendance/status');
  },
  getWeeklyLogs: async (employeeId = null) => {
    const query = employeeId ? `?employeeId=${employeeId}` : '';
    return await api.get(`/attendance/weekly${query}`);
  }
};
