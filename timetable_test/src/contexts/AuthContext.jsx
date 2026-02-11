import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, handleAPIError } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      authAPI.getCurrentUser()
        .then(data => {
          setUser(data.user);
        })
        .catch(error => {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const data = await authAPI.login(username, password);
      const userData = data.user;
      
      setUser(userData);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success(`Welcome back, ${userData.username}!`);
      return true;
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    switch (permission) {
      case 'create':
      case 'edit':
      case 'delete':
        return user.role === 'admin' || user.role === 'editor';
      case 'view':
        return true;
      case 'admin':
        return user.role === 'admin';
      default:
        return false;
    }
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
