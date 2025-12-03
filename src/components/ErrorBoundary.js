// src/components/ErrorBoundary.js
import React from 'react';
import logger from '../services/loggingService'; // Import our structured logger

/**
 * React Error Boundary component to catch JavaScript errors in a component subtree,
 * log them, and display a fallback UI.
 * 
 * Learn more: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    logger.error("Frontend Rendering Error Caught by ErrorBoundary", error, {
      componentStack: errorInfo.componentStack,
      errorInfo: errorInfo,
    });
    this.setState({ errorInfo: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ padding: '20px', border: '1px solid red', margin: '20px', backgroundColor: '#ffe6e6' }}>
          <h2>Something went wrong.</h2>
          <p>We're sorry for the inconvenience. Our team has been notified.</p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button onClick={() => window.location.reload()} style={{ marginTop: '10px', padding: '10px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
