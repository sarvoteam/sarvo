import { api } from './client';

export const cohortApi = {
  getCohorts: async () => {
    return await api.get('/cohorts');
  },
  createCohort: async (data) => {
    return await api.post('/cohorts', data);
  },
  addCohortMember: async (cohortId, employeeId) => {
    return await api.post('/cohorts/members', { cohortId, employeeId });
  },
  getCohortMembers: async (cohortId) => {
    return await api.get(`/cohorts/members/${cohortId}`);
  },
  getAvailableInterns: async () => {
    return await api.get('/cohorts/available-interns');
  },
  getAvailableMentors: async () => {
    return await api.get('/cohorts/available-mentors');
  }
};
