// src/services/loggingService.js

/**
 * A simple structured logging service.
 * In a real-world app, this would be integrated with a remote logging service
 * like Sentry, Datadog, or a custom logging backend.
 * 
 * It holds the trace_id for the current "session" to correlate logs.
 */

let traceId = null;

const log = (level, message, props = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    trace_id: traceId,
    ...props,
  };

  // In a real app, you might send this to a logging endpoint.
  // For this assignment, we'll use console and color-code it.
  const consoleMethod = console[level] || console.log;
  consoleMethod(JSON.stringify(logEntry, null, 2));
};

const logger = {
  info: (message, props) => log('info', message, props),
  warn: (message, props) => log('warn', message, props),
  error: (message, error, props) => {
    // Ensure the error object is serializable and clear.
    const errorInfo = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    };
    log('error', message, { ...props, ...errorInfo });
  },
  
  /**
   * Sets the trace ID to be included in subsequent logs.
   * This should be called after receiving an API response that contains
   * the X-Trace-ID header.
   * @param {string} newTraceId The correlation ID from the backend.
   */
  setTraceId: (newTraceId) => {
    if (newTraceId) {
      traceId = newTraceId;
    }
  },

  /**
   * Clears the current trace ID.
   */
  clearTraceId: () => {
    traceId = null;
  }
};

export default logger;
