// src/api/endpoints.ts
import type { AxiosInstance } from 'axios';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
}) as AxiosInstance;

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`, true);
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { name: string; email: string; password: string }) =>
    api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

// Posts endpoints
export const postsAPI = {
  getAllPosts: () => api.get('/posts'),
  getPost: (id: string) => api.get(`/posts/${id}`),
  createPost: (postData: { text: string; image?: string }) => 
    api.post('/posts', postData),
  likePost: (postId: string) => api.put(`/posts/like/${postId}`),
  addComment: (postId: string, comment: string) => 
    api.post(`/posts/comment/${postId}`, { text: comment })
};

// Users endpoints
export const usersAPI = {
  getUserProfile: (userId: string) => api.get(`/users/${userId}`),
  followUser: (userId: string) => api.put(`/users/follow/${userId}`),
  getUserPosts: (userId: string) => api.get(`/users/posts/${userId}`)
};

// Upload endpoints
export const uploadAPI = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

export default {
  auth: authAPI,
  posts: postsAPI,
  users: usersAPI,
  upload: uploadAPI
};