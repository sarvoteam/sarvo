import { api } from './client';

export const employeeApi = {
  getEmployees: async () => {
    return await api.get('/employees/list');
  },
  addEmployee: async (empData) => {
    return await api.post('/employees/add', empData);
  },
  getProfile: async () => {
    return await api.get('/employees/profile');
  },
  getMeta: async () => {
    return await api.get('/employees/meta');
  }
};
