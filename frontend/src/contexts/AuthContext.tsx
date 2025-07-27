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
      const token = localStorage.getItem('authToken');
      console.log('[DEBUG] checkAuthStatus called, token exists:', !!token);
      const userData = await authApi.getProfile();
      console.log('[DEBUG] Profile retrieved successfully:', userData);
      setUser(userData.user);
    } catch (error) {
      console.log('[DEBUG] Auth check failed:', error);
      console.log('[DEBUG] Error message:', error instanceof Error ? error.message : 'Unknown error');
      // Don't clear user immediately, keep them logged in if there's a network error
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        console.log('[DEBUG] Auth check failed but keeping user logged in:', error.message);
      } else {
        setUser(null);
        localStorage.removeItem('authToken');
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('[DEBUG] Login attempt for:', email);
      const response = await authApi.login(email, password);
      console.log('[DEBUG] Login response:', response);
      
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        setUser(response.user);
        return true;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.log('[DEBUG] Login failed:', error);
      console.log('[DEBUG] Error message:', error instanceof Error ? error.message : 'Unknown error');
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