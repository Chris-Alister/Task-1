import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOGIN_MUTATION, REGISTER_TEACHER_MUTATION, GET_ME_QUERY, UPDATE_PROFILE_MUTATION } from '../graphql/auth';

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
  const [token, setToken] = useState(localStorage.getItem('token'));

  // GraphQL Mutations
  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_TEACHER_MUTATION);
  const [updateProfileMutation] = useMutation(UPDATE_PROFILE_MUTATION);

  // Query current user profile
  const { refetch: refetchProfile } = useQuery(GET_ME_QUERY, {
    skip: !token,
    onCompleted: (data) => {
      setUser(data.me);
      setLoading(false);
    },
    onError: (error) => {
      console.error('Auth check failed:', error);
      logout();
      setLoading(false);
    },
    fetchPolicy: 'cache-and-network',
  });

  // Check authentication on token change
  useEffect(() => {
    if (token) {
      refetchProfile();
    } else {
      setLoading(false);
    }
  }, [token, refetchProfile]);

  const login = async (email, password) => {
    try {
      const { data } = await loginMutation({
        variables: {
          input: { email, password }
        }
      });
      
      const { token: newToken, user: userData } = data.login;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const register = async (userData) => {
    try {
      const { data } = await registerMutation({
        variables: {
          input: userData
        }
      });
      return { success: true, data: data.registerTeacher };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await updateProfileMutation({
        variables: {
          input: profileData
        }
      });
      setUser(data.updateProfile);
      return { success: true, data: data.updateProfile };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Profile update failed'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 