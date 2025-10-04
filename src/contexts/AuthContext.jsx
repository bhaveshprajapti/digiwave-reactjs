import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      dispatch({ type: 'LOGOUT' });
      return;
    }

    try {
      const response = await authAPI.getCurrentUser();
      
      // Enhanced user object with role and permissions
      const enhancedUser = {
        ...response.data,
        role_name: response.data.role_name || (response.data.is_superuser ? 'superadmin' : 'employee'),
        permissions: response.data.permissions || [],
        can_approve_leaves: response.data.permissions?.includes('approve_leave') || response.data.is_superuser,
        can_manage_users: response.data.permissions?.includes('manage_users') || response.data.is_superuser,
      };
      
      dispatch({ type: 'SET_USER', payload: enhancedUser });
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authAPI.login(credentials);
      const { access, refresh, user } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Enhanced user object with role and permissions
      const enhancedUser = {
        ...user,
        role_name: user.role_name || (user.is_superuser ? 'superadmin' : 'employee'),
        permissions: user.permissions || [],
        can_approve_leaves: user.permissions?.includes('approve_leave') || user.is_superuser,
        can_manage_users: user.permissions?.includes('manage_users') || user.is_superuser,
      };
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: enhancedUser } });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail || 
                          'Login failed';
      
      dispatch({ type: 'LOGIN_FAILURE', payload: { error: errorMessage } });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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
