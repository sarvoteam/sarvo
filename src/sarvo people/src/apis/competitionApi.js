import { api } from './client';

export const competitionApi = {
  getCompetitions: async (companyId = 'default') => {
    return await api.get('/competitions/list', {
      headers: {
        'x-company-id': companyId
      }
    });
  },
  getCompetitionById: async (id) => {
    return await api.get(`/competitions/${id}`);
  },
  createCompetition: async (competitionData) => {
    return await api.post('/competitions/create', competitionData);
  },
  updateCompetition: async (id, competitionData) => {
    return await api.put(`/competitions/${id}`, competitionData);
  },
  deleteCompetition: async (id) => {
    return await api.delete(`/competitions/${id}`);
  },
  getRegistrations: async (competitionId) => {
    return await api.get(`/competitions/${competitionId}/registrations`);
  },
  registerStudent: async (competitionId, data) => {
    return await api.post(`/competitions/${competitionId}/register`, data);
  },
  deleteRegistration: async (registrationId) => {
    return await api.delete(`/competitions/registrations/${registrationId}`);
  }
};
