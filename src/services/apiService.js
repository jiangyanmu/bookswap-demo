// src/services/apiService.js
import axios from 'axios';
import logger from './loggingService'; // Import our structured logger

const API_BASE_URL = 'http://localhost:8000'; // Our backend is running on port 8000

let authToken = null; // Store the authentication token

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: To potentially add custom headers, e.g., for auth tokens
api.interceptors.request.use(config => {
  logger.info(`API Request: ${config.method.toUpperCase()} ${config.url}`, {
    method: config.method.toUpperCase(),
    url: config.url,
    data: config.data,
  });
  // Add authentication token to headers if available
  if (authToken) {
    config.headers['X-Auth-Token'] = authToken;
  }
  // Attach a timestamp to the request config to calculate latency later
  config.metadata = { startTime: new Date() };
  return config;
}, error => {
  logger.error("API Request Failed", error, {
    method: error.config?.method?.toUpperCase(),
    url: error.config?.url,
  });
  return Promise.reject(error);
});

// Response Interceptor: To log responses, measure latency, and extract trace_id
api.interceptors.response.use(response => {
  const endTime = new Date();
  const startTime = response.config.metadata.startTime;
  const latencyMs = endTime.getTime() - startTime.getTime();

  logger.info(`API Response: ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`, {
    method: response.config.method.toUpperCase(),
    url: response.config.url,
    status: response.status,
    latency_ms: latencyMs,
    data: response.data,
  });

  // Extract trace_id from backend response headers and update logger
  const traceId = response.headers['x-trace-id'];
  if (traceId) {
    logger.setTraceId(traceId);
  }

  return response;
}, error => {
  const endTime = new Date();
  const startTime = error.config?.metadata?.startTime || endTime; // Fallback if no startTime
  const latencyMs = endTime.getTime() - startTime.getTime();

  const errorDetails = {
    method: error.config?.method?.toUpperCase(),
    url: error.config?.url,
    status: error.response?.status,
    latency_ms: latencyMs,
    response_data: error.response?.data,
    message: error.message,
  };

  logger.error("API Response Error", error, errorDetails);

  return Promise.reject(error); // Re-throw the error so components can handle it
});

/**
 * Standardized API service for frontend-backend communication.
 * Includes structured logging, latency measurement, and trace ID propagation.
 */
const apiService = {
  // Function to set the authentication token dynamically
  setAuthToken: (token) => {
    authToken = token;
  },

  // New login function for simple auth
  login: async (username, password) => {
    const response = await api.post('/api/login', { username, password });
    return response.data; // Should return { access_token: "username:role", token_type: "bearer" }
  },

  // New register function
  register: async (username, email, password, role) => {
    const response = await api.post('/users/', { username, email, password, role });
    return response.data;
  },

  // New function to fetch current user (can be used to verify token)
  fetchCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data; // Should return user object
  },

  // New function for sellers to create a book
  createBook: async (bookData) => {
    const response = await api.post('/api/books/', bookData);
    return response.data;
  },

  // Existing book fetching functions
  getBooks: async () => {
    const response = await api.get('/api/books');
    return response.data;
  },
  getBookById: async (id) => {
    const response = await api.get(`/api/books/${id}`);
    return response.data;
  },

  // Original functions (kept for compatibility if needed)
  oldLogin: (password) => { // Renamed to avoid conflict with new login
    // This calls the old /login endpoint
    return api.post('/login', { password: password });
  },
  placeBid: (bookId, amount) => {
    return api.post('/bid', { book_id: bookId, amount: amount });
  },
  getMetrics: () => {
    return api.get('/metrics', {
      transformResponse: [(data) => data],
      headers: {
        'Accept': 'text/plain',
      },
    });
  },
};

export default apiService;
