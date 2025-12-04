import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import BookDetail from './components/BookDetail';
import CreateBook from './components/CreateBook';
import MetricsDashboard from './components/MetricsDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <div className="App font-sans text-gray-900">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/books/:id" element={<BookDetail />} />
              
              {/* Protected Routes */}
              <Route 
                path="/create-book" 
                element={
                  <ProtectedRoute>
                    <CreateBook />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <MetricsDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;