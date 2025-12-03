import React, { createContext, useState, useEffect, useContext } from 'react';
import apiService from '../services/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        localStorage.setItem('token', token);
        // Simple token format: "username:role"
        try {
          const [username, role] = token.split(':');
          setUser({ username, role });
          apiService.setAuthToken(token); // Set token in API service
        } catch (e) {
          console.error("Invalid token format", e);
          logout();
        }
      } else {
        localStorage.removeItem('token');
        setUser(null);
        apiService.setAuthToken(null); // Clear token in API service
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (username, password) => {
    try {
      // The backend now returns a simple token object { access_token: "username:role", ... }
      const data = await apiService.login(username, password);
      if (data.access_token) {
        setToken(data.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isSeller: user && user.role === 'seller',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);