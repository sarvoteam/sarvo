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
  },
  getCohortStudents: async (cohortId) => {
    return await api.get(`/cohorts/${cohortId}/students`);
  },
  addCohortStudent: async (cohortId, studentData) => {
    return await api.post(`/cohorts/${cohortId}/students`, studentData);
  },
  getAllStudents: async () => {
    return await api.get('/cohorts/students/all');
  },
  updateStudentProfile: async (studentId, profileData) => {
    return await api.put(`/cohorts/students/${studentId}/profile`, profileData);
  },
  updateCohortStatus: async (cohortId, status) => {
    return await api.put(`/cohorts/${cohortId}/status`, { status });
  }
};
