'use client';

import { createContext, useContext } from 'react';

// Types
export interface UserProfile {
  id?: number;
  user_type: 'FARMER' | 'RESEARCHER' | 'STARTUP' | 'INDUSTRY' | 'OTHER';
  organization?: string;
  bio?: string;
  address?: string;
  phone_number?: string;
  profile_image?: string;
  country?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile?: UserProfile;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  user_type: 'Farmer' | 'Researcher' | 'Startup' | 'Industry';
  phone_number?: string;
  address?: string;
  bio?: string;
  country?: string;
}

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Add a debug function to check token validity
export const checkAuthToken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    console.log('Current auth token:', token ? `${token.substring(0, 10)}...` : 'No token found');
    return !!token;
  }
  return false;
};

// Export a function to get the token
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 