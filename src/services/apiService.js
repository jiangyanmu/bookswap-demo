// src/services/apiService.js
import axios from 'axios';
import logger from './loggingService'; // Import our structured logger

const API_BASE_URL = 'http://localhost:8000'; // Our backend is running on port 8000

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
  login: (password) => {
    // Our backend expects the password in the request body
    return api.post('/login', { password: password });
  },

  placeBid: (bookId, amount) => {
    return api.post('/bid', { book_id: bookId, amount: amount });
  },
  
  getMetrics: () => {
    // The metrics endpoint returns plain text, so we override the default JSON parsing
    return api.get('/metrics', {
      transformResponse: [(data) => data], // Keep the response as plain text
      headers: {
        'Accept': 'text/plain',
      },
    });
  },

  // Add other API calls here as needed
  getBooks: async () => {
    const response = await api.get('/api/books');
    return response.data;
  },
  getBookById: async (id) => {
    const response = await api.get(`/api/books/${id}`);
    return response.data;
  },
};

export default apiService;
