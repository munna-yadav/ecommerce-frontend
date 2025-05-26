import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';

// Define the shape of the user object
interface User {
  id?: string;
  username: string;
  name: string;
  email?: string;
  role: string;
}

// Define the shape of the auth context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  checkAuthStatus: async () => false,
});

// Provider component that wraps the app and provides auth context
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const navigate = useNavigate();

  // Function to check if user is authenticated
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    console.log("Checking auth status...");
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log("No token found, not authenticated");
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      setAuthChecked(true);
      return false;
    }

    try {
      console.log("Token found, verifying with backend...");
      // Using the axiosInstance that automatically includes the Bearer token
      const response = await axiosInstance.get('/api/v1/user/me');
      console.log("Auth check successful:", response.data);

      const userData: User = {
        id: response.data.id,
        username: response.data.username,
        name: response.data.name || response.data.username,
        email: response.data.email,
        role: response.data.role,
      };

      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
      setAuthChecked(true);
      return true;
    } catch (error) {
      console.error('Authentication check error:', error);
      
      // Don't clear token here - that's handled by axios interceptor
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      setAuthChecked(true);
      return false;
    }
  }, []);

  // Function to handle user login
  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/api/v1/auth/login', {
        emailOrUsername,
        password
      });

      // The token might be nested differently in the response
      // Check the actual structure in your console log
      console.log("Login response:", response.data);
      const token = response.data.token || response.data.accessToken || response.data.access_token;
      
      if (!token) {
        console.error('No token received in login response:', response.data);
        toast.error('Authentication error: No token received');
        setIsLoading(false);
        return false;
      }

      // Store the token in localStorage
      localStorage.setItem('token', token);
      
      // Get user data after successful login
      const authSuccess = await checkAuthStatus();
      
      if (authSuccess) {
        toast.success('Login successful!');
        return true;
      } else {
        // If checkAuthStatus fails, it means the token might be invalid
        toast.error('Failed to retrieve user data');
        setIsLoading(false);
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      setIsLoading(false);
      return false;
    }
  };

  // Function to handle user registration
  const register = async (userData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Sending registration data:', userData);
      
      // Try with fetch API to have more control over the exact format
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Registration failed with status ${response.status}`);
      }
      
      toast.success('Registration successful! Please log in.');
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.message || 'Registration failed';
      toast.error(message);
      setIsLoading(false);
      return false;
    }
  };

  // Function to handle user logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    
    // Navigate to home page and replace current history entry
    navigate('/', { replace: true });
  };

  // Check authentication status when the app loads
  useEffect(() => {
    console.log("AuthProvider mounted, checking auth status...");
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Create the auth context value
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  if (!authChecked) {
    // Don't render children until we've finished the initial auth check
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;