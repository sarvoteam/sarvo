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
  },
  getMonthlyLogs: async (month, employeeId = null) => {
    const empQuery = employeeId ? `&employeeId=${employeeId}` : '';
    return await api.get(`/attendance/monthly?month=${month}${empQuery}`);
  },
  submitRegularization: async (data) => {
    return await api.post('/attendance/regularize', data);
  },
  listRegularizations: async (employeeId = null) => {
    const query = employeeId ? `?employeeId=${employeeId}` : '';
    return await api.get(`/attendance/regularization-list${query}`);
  },
  updateRegularizationStatus: async (id, status, remarks) => {
    return await api.put(`/attendance/regularize/${id}`, { status, remarks });
  },
  getStudentsStatus: async (date, cohortId = '') => {
    const query = cohortId ? `&cohortId=${cohortId}` : '';
    return await api.get(`/attendance/students-status?date=${date}${query}`);
  },
  markStudentAttendance: async (studentId, date, status, checkInTime = null, checkOutTime = null) => {
    return await api.post('/attendance/mark-student', { studentId, date, status, checkInTime, checkOutTime });
  }
};
