// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://smartquizapp-production-cffd.up.railway.app/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://smartquizapp-production-cffd.up.railway.app';

// API Helper Functions
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'x-auth-token': token }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Auth API
export const authAPI = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    userType: 'student' | 'teacher';
    rollNo?: string;
  }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};

// Quiz API
export const quizAPI = {
  getAll: async () => {
    return apiRequest('/quiz');
  },

  getById: async (id: string) => {
    return apiRequest(`/quiz/${id}`);
  },

  create: async (quizData: any) => {
    return apiRequest('/quiz', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  },

  update: async (id: string, quizData: any) => {
    return apiRequest(`/quiz/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quizData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/quiz/${id}`, {
      method: 'DELETE',
    });
  },

  submit: async (id: string, answers: any[], timeTaken: number) => {
    return apiRequest(`/quiz/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers, timeTaken }),
    });
  },

  getResults: async (id: string) => {
    return apiRequest(`/quiz/${id}/results`);
  },
};

// User API
export const userAPI = {
  getMe: async () => {
    return apiRequest('/users/me');
  },

  getLeaderboard: async () => {
    return apiRequest('/users/leaderboard');
  },

  getResults: async () => {
    return apiRequest('/users/results');
  },
};
