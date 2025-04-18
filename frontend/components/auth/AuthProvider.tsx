'use client';

import { useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import { AuthContext, User, RegisterData, API_URL } from '@/lib/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if this is an auth page
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');

  // Check for existing token and load user on mount, but only if not on auth pages
  useEffect(() => {
    // Skip auto-login on auth pages to prevent hydration issues
    if (isAuthPage) {
      setLoading(false);
      return;
    }
    
    const loadUser = async () => {
      // Only access localStorage on the client side
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Set default auth header for axios
        axios.defaults.headers.common['Authorization'] = `Token ${token}`;
        
        // Fetch user data
        const response = await axios.get(`${API_URL}/api/users/me/`);
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (err) {
        // Clear invalid token
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [isAuthPage]);

  // Login function
  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/api-token-auth/`, {
        username,
        password
      });
      
      const { token } = response.data;
      
      // Store token and set auth header
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      // Fetch user data
      const userResponse = await axios.get(`${API_URL}/api/users/me/`);
      setUser(userResponse.data);
      setIsAuthenticated(true);
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.post(`${API_URL}/api/users/`, userData);
      // Login after successful registration
      await login(userData.username, userData.password);
    } catch (err: any) {
      const errorData = err.response?.data;
      let errorMessage = 'Registration failed. Please try again.';
      
      // Format validation errors
      if (errorData) {
        const firstError = Object.entries(errorData)[0];
        if (firstError && Array.isArray(firstError[1])) {
          errorMessage = `${firstError[0]}: ${firstError[1][0]}`;
        }
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`${API_URL}/api/users/update_me/`, data);
      // Update the user state with the response data
      setUser(response.data);
      console.log('Profile updated successfully:', response.data);
    } catch (err: any) {
      console.error('Profile update error:', err.response?.data || err.message);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
} 