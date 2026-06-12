import { api } from './client';

export const lmsApi = {
  getQuizGrades: async (employeeId = null) => {
    const query = employeeId ? `?employeeId=${employeeId}` : '';
    return await api.get(`/lms/quiz-grades${query}`);
  },
  saveQuizGrade: async (gradeData) => {
    return await api.post('/lms/quiz-grades', gradeData);
  }
};
