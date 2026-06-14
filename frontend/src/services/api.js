import axios from 'axios';
import { useAuthStore } from '../store/stores.js';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// ==================== Auth API ====================
export const authAPI = {
  register: (name, email, password) =>
    apiClient.post('/auth/register', { name, email, password }),

  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  logout: () =>
    apiClient.post('/auth/logout'),

  getCurrentUser: () =>
    apiClient.get('/auth/me'),

  updateProfile: (name) =>
    apiClient.put('/auth/profile', { name }),

  changePassword: (currentPassword, newPassword) =>
    apiClient.put('/auth/change-password', { currentPassword, newPassword }),
};

// ==================== Question API ====================
export const questionAPI = {
  getSubjects: () =>
    apiClient.get('/questions/subjects'),

  getTopicsBySubject: (subjectId) =>
    apiClient.get(`/questions/topics/subject/${subjectId}`),

  getQuestions: (filters = {}) =>
    apiClient.get('/questions/questions', { params: filters }),

  getQuestionById: (id) =>
    apiClient.get(`/questions/questions/${id}`),

  createQuestion: (data) =>
    apiClient.post('/questions/questions', data),

  updateQuestion: (id, data) =>
    apiClient.put(`/questions/questions/${id}`, data),

  deleteQuestion: (id) =>
    apiClient.delete(`/questions/questions/${id}`),
};

// ==================== Test API ====================
export const testAPI = {
  startTest: (questionIds) =>
    apiClient.post('/tests/start', { questionIds }),

  getTestDetails: (testId) =>
    apiClient.get(`/tests/${testId}`),

  saveAnswer: (testId, questionId, selectedOption, timeSpent, isMarkedForReview) =>
    apiClient.post(`/tests/${testId}/answer`, {
      questionId,
      selectedOption,
      timeSpent,
      isMarkedForReview,
    }),

  submitTest: (testId, reason = 'manual') =>
    apiClient.post(`/tests/${testId}/submit`, { reason }),

  recordViolation: (testId, violationType) =>
    apiClient.post(`/tests/${testId}/violation`, { violationType }),

  getTestResults: (testId) =>
    apiClient.get(`/tests/${testId}/results`),

  getUserTestHistory: (page = 1, limit = 10) =>
    apiClient.get('/tests/history', { params: { page, limit } }),
};

// ==================== Admin API ====================
export const adminAPI = {
  getUsers: (params = {}) =>
    apiClient.get('/admin/users', { params }),

  toggleBlockUser: (userId) =>
    apiClient.patch(`/admin/users/${userId}/toggle-block`),

  deleteUser: (userId) =>
    apiClient.delete(`/admin/users/${userId}`),

  getDashboardStats: () =>
    apiClient.get('/admin/dashboard/stats'),

  getPlatformAnalytics: () =>
    apiClient.get('/admin/analytics'),
};

export default apiClient;
