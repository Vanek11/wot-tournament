import axios from 'axios';
import dataAdapter, { isStaticMode } from './dataAdapter.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const USE_STATIC = import.meta.env.VITE_USE_STATIC_DATA === 'true' || !import.meta.env.VITE_API_URL;

// Create axios instance for API mode
const apiAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
apiAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Proxy object that uses adapter in static mode
const api = USE_STATIC ? dataAdapter : apiAxios;

export default api;
export { isStaticMode };

