import { api } from './client';

export const personalTaskApi = {
  getTasks: async () => {
    return await api.get('/personal-tasks');
  },
  createTask: async (taskData) => {
    return await api.post('/personal-tasks', taskData);
  },
  toggleTask: async (id, completed) => {
    return await api.put(`/personal-tasks/${id}`, { completed });
  },
  deleteTask: async (id) => {
    return await api.delete(`/personal-tasks/${id}`);
  }
};
