import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import setAuthToken from '../utils/setAuthToken';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        setAuthToken(token);
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('token');
          setAuthToken(null);
        }
      }
      
      setLoading(false);
    };
    
    loadUser();
  }, []);
  
  // Register user
  const register = async (userData) => {
    try {
      const res = await api.post('/api/auth/register', userData);
      
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      
      setUser(res.data.user);
      setIsAuthenticated(true);
      setLoading(false);
      setError(null);
      
      return res.data;
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
      throw err;
    }
  };
  
  // Login user
  const login = async (userData) => {
    try {
      const res = await api.post('/api/auth/login', userData);
      
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      
      setUser(res.data.user);
      setIsAuthenticated(true);
      setLoading(false);
      setError(null);
      
      return res.data;
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials.'
      );
      throw err;
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };
  
  // Clear errors
  const clearError = () => {
    setError(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);