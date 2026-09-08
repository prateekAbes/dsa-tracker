import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

let getAuthToken = null;

export const setAuthTokenGetter = (fn) => {
  getAuthToken = fn;
};

api.interceptors.request.use(
  async (config) => {
    if (getAuthToken) {
      const token = await getAuthToken();
      if (token) {
        config.headers.authorization = `Bearer ${token}`;
      }
    } else if (window.Clerk && window.Clerk.session) {
      const token = await window.Clerk.session.getToken();
      if (token) {
        config.headers.authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const fetchProblems = async (params) => {
  const response = await api.get('/problems', { params });
  return response.data;
};

export const fetchProblem = async (number) => {
  const response = await api.get(`/problems/${number}`);
  return response.data;
};

export const updateProblem = async (number, data) => {
  const response = await api.patch(`/problems/${number}`, data);
  return response.data;
};

export const bulkUpdateProblems = async (numbers, update) => {
  const response = await api.patch('/problems/bulk/update', { numbers, update });
  return response.data;
};

export const resetAllProgress = async () => {
  const response = await api.post('/problems/reset');
  return response.data;
};

export const fetchStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const fetchTopicStats = async () => {
  const response = await api.get('/stats/topics');
  return response.data;
};

export const fetchStreak = async () => {
  const response = await api.get('/stats/streak');
  return response.data;
};

export const fetchOriginalStats = async () => {
  const response = await api.get('/stats/original-369');
  return response.data;
};

export const createProblem = async (problemData) => {
  const response = await api.post('/problems', problemData);
  return response.data;
};

export const deleteProblem = async (number) => {
  const response = await api.delete(`/problems/${number}`);
  return response.data;
};

export const addSolution = async (number, solutionData) => {
  const response = await api.post(`/problems/${number}/solutions`, solutionData);
  return response.data;
};

export const deleteSolution = async (number, solutionId) => {
  const response = await api.delete(`/problems/${number}/solutions/${solutionId}`);
  return response.data;
};

export const syncUser = async () => {
  await api.post('/sync');
};
