import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userSegment, setUserSegment] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const segment = localStorage.getItem('userSegment');

    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
      if (segment) setUserSegment(segment);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      setIsAuthenticated(true);
      setUserRole(response.role);
      if (response.segment) {
        setUserSegment(response.segment);
        localStorage.setItem('userSegment', response.segment);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiLogout();
    setIsAuthenticated(false);
    setUserRole(null);
    setUserSegment(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      userSegment,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 