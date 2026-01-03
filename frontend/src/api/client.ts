import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError, ProblemDetails } from '../types';

// API base URLs - configured for Docker networking
// In production, these would be proxied through nginx or use environment variables
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5001';
const RESOURCE_API_URL = import.meta.env.VITE_RESOURCE_API_URL || 'http://localhost:5002';

/**
 * Axios instance for Auth Service API calls
 */
export const authApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Axios instance for Resource Service API calls
 * Automatically includes JWT token in Authorization header
 */
export const resourceApi = axios.create({
  baseURL: RESOURCE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Token storage key in localStorage
 */
const TOKEN_KEY = 'smart_office_token';

/**
 * Get the stored JWT token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Store the JWT token
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove the stored JWT token
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Request interceptor to add JWT token to Authorization header
 */
const addAuthHeader = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

/**
 * Response error interceptor for handling authentication errors
 */
const handleAuthError = (error: AxiosError<ProblemDetails>): Promise<never> => {
  if (error.response?.status === 401) {
    // Token expired or invalid - clear storage and redirect to login
    removeToken();
    localStorage.removeItem('smart_office_role');
    
    // Dispatch custom event for auth state change
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
  
  return Promise.reject(transformError(error));
};

/**
 * Transform Axios error to consistent ApiError format
 */
const transformError = (error: AxiosError<ProblemDetails>): ApiError => {
  if (error.response) {
    const data = error.response.data;
    let message = data?.detail || data?.title || 'An error occurred';
    
    // Extract validation errors if present
    if (data?.errors && typeof data.errors === 'object') {
      const errorMessages = Object.entries(data.errors)
        .flatMap(([field, messages]) => messages.map(msg => `${field}: ${msg}`))
        .join('; ');
      if (errorMessages) {
        message = errorMessages;
      }
    }
    
    return {
      message,
      status: error.response.status,
      details: data,
    };
  }
  
  if (error.request) {
    return {
      message: 'Network error - please check your connection',
      status: 0,
    };
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    status: 0,
  };
};

// Apply interceptors to resourceApi (requires authentication)
resourceApi.interceptors.request.use(addAuthHeader);
resourceApi.interceptors.response.use(
  (response) => response,
  handleAuthError
);

// Auth API doesn't need auth header, but still transform errors
authApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ProblemDetails>) => Promise.reject(transformError(error))
);
