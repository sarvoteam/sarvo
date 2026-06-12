import { api } from './client';

export const jobApi = {
  getJobs: async (companyId = 'default') => {
    return await api.get('/jobs/list', {
      headers: {
        'x-company-id': companyId
      }
    });
  },
  createJob: async (jobData) => {
    return await api.post('/jobs/create', jobData);
  },
  applyForJob: async (jobId, candidateData) => {
    return await api.post(`/jobs/apply/${jobId}`, candidateData);
  },
  getApplications: async () => {
    return await api.get('/jobs/applications');
  },
  updateApplicationStatus: async (applicationId, status, interviewDate) => {
    return await api.patch(`/jobs/applications/${applicationId}`, { status, interviewDate });
  }
};
