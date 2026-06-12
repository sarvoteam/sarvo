import { api } from './client';

export const authApi = {
  login: async (email, password) => {
    return await api.post('/employees/login', { email, password });
  },
  getProfile: async () => {
    return await api.get('/employees/profile');
  },
  listEmployees: async () => {
    return await api.get('/employees/list');
  },
  getOrgMeta: async () => {
    return await api.get('/employees/meta');
  },
  addEmployee: async (empData) => {
    return await api.post('/employees/add', empData);
  },
  register: async (internData) => {
    return await api.post('/employees/register', internData);
  }
};
