import { api } from './client';

export const lmsApi = {
  getQuizGrades: async (employeeId = null) => {
    const query = employeeId ? `?employeeId=${employeeId}` : '';
    return await api.get(`/lms/quiz-grades${query}`);
  },
  saveQuizGrade: async (gradeData) => {
    return await api.post('/lms/quiz-grades', gradeData);
  },
  getInterviewQuestions: async (testId = null) => {
    const query = testId ? `?testId=${testId}` : '';
    return await api.get(`/lms/interview-questions${query}`);
  },
  createInterviewQuestion: async (questionData) => {
    return await api.post('/lms/interview-questions', questionData);
  },
  updateInterviewQuestion: async (questionId, questionData) => {
    return await api.put(`/lms/interview-questions/${questionId}`, questionData);
  },
  deleteInterviewQuestion: async (questionId) => {
    return await api.delete(`/lms/interview-questions/${questionId}`);
  }
};

