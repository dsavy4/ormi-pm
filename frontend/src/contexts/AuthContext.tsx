import React, { createContext, useContext, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { authApi } from '@/lib/api';

// API Configuration
const API_BASE_URL = 'https://api.ormi.com';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    console.log('AuthContext: Checking for token on mount:', token ? 'Token found' : 'No token');
    if (token) {
      checkAuthStatus();
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      console.log('AuthContext: checkAuthStatus called, token exists:', !!token);
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Use the authApi.getProfile() function for better error handling
      console.log('AuthContext: Calling authApi.getProfile()');
      const userData = await authApi.getProfile();
      console.log('AuthContext: Profile retrieved successfully:', userData);
      setUser(userData);
    } catch (error: any) {
      console.error('AuthContext: Auth check failed:', error);
      console.error('AuthContext: Error message:', error.message);
      
      // Check if it's a 401 error (unauthorized) - handle both error message formats
      if (error.message?.includes('401') || 
          error.message?.includes('Unauthorized') ||
          error.message?.includes('Invalid or expired token') ||
          error.message?.includes('Access token required')) {
        console.log('AuthContext: Token expired or invalid, logging out');
        localStorage.removeItem('auth_token');
        setUser(null);
      } else {
        // For network errors or other issues, keep user logged in
        console.warn('AuthContext: Auth check failed but keeping user logged in:', error.message);
        // Don't logout on network errors - keep user logged in
        // This prevents logout on temporary network issues
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login(email, password);
      
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.message?.includes('401') || error.message?.includes('Invalid')) {
        toast.error('Invalid credentials. Please check your email and password.', {
          duration: 4000,
          position: 'bottom-right',
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        });
      } else {
        toast.error('Login failed. Please try again.', {
          duration: 4000,
          position: 'bottom-right',
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        });
      }
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    toast.success('Signed out successfully', {
      duration: 3000,
      position: 'bottom-right',
      style: {
        background: 'hsl(var(--card))',
        color: 'hsl(var(--foreground))',
        border: '1px solid hsl(var(--border))',
      },
    });
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <Toaster
        position="bottom-right"
        gutter={12}
        containerClassName="bottom-right-toaster"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '400px',
            minHeight: '32px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
          success: {
            style: {
              borderLeft: '4px solid hsl(var(--ormi-primary))',
            },
            iconTheme: {
              primary: 'hsl(var(--ormi-primary))',
              secondary: 'hsl(var(--card))',
            },
          },
          error: {
            style: {
              borderLeft: '4px solid hsl(var(--destructive))',
            },
            iconTheme: {
              primary: 'hsl(var(--destructive))',
              secondary: 'hsl(var(--card))',
            },
          },
          loading: {
            style: {
              borderLeft: '4px solid hsl(var(--muted-foreground))',
            },
            iconTheme: {
              primary: 'hsl(var(--muted-foreground))',
              secondary: 'hsl(var(--card))',
            },
          },
        }}
      />
    </AuthContext.Provider>
  );
}; 