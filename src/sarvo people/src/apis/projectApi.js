import { api } from './client';

export const projectApi = {
  getProjects: async () => {
    return await api.get('/projects/list');
  },
  createProject: async (projectData) => {
    return await api.post('/projects/create', projectData);
  },
  assignProjectMembers: async (projectId, members) => {
    return await api.post(`/projects/${projectId}/assign`, { members });
  },
  getProjectMembers: async (projectId) => {
    return await api.get(`/projects/${projectId}/members`);
  },
  getTasks: async () => {
    return await api.get('/projects/tasks');
  },
  createTask: async (taskData) => {
    return await api.post('/projects/tasks/create', taskData);
  },
  logTime: async (logData) => {
    return await api.post('/projects/timelogs', logData);
  },
  getTimeLogs: async () => {
    return await api.get('/projects/timelogs');
  }
};
