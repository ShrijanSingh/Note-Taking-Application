import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  requestOtp: async (email: string) => {
    const response = await api.post('/auth/otp/request', { email });
    return response.data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  verifyGoogleToken: async (token: string) => {
    try {
      const response = await api.post('/auth/google', { token });
      return response.data;
    } catch (error: any) {
      console.error('Google token verification error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 401) {
        throw new Error('Unauthorized: Please check your Google account permissions');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid token: Please try signing in again');
      } else {
        throw new Error('Failed to verify Google token. Please try again later.');
      }
    }
  },
};

export const noteService = {
  getNotes: async () => {
    const response = await api.get('/notes');
    return response.data;
  },

  createNote: async (title: string, content: string) => {
    const response = await api.post('/notes', { title, content });
    return response.data;
  },

  updateNote: async (id: string, title: string, content: string) => {
    const response = await api.put(`/notes/${id}`, { title, content });
    return response.data;
  },

  deleteNote: async (id: string) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },
};
