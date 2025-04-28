import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  // Function to check if user is authenticated
  const checkAuthStatus = async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return false;
    }

    try {
      const response = await axios.get('/api/v1/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Handle token expiration
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      }
      
      setIsLoading(false);
      return false;
    }
  };

  // Function to handle user login
  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/v1/auth/login', {
        emailOrUsername,
        password
      });

     

      // The token might be nested differently in the response
      // Check the actual structure in your console log
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
    } catch (error) {
      console.error('Login error:', error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Login failed'
        : 'Login failed';
      toast.error(message);
      setIsLoading(false);
      return false;
    }
  };

  // Function to handle user registration
  const register = async (userData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      await axios.post('/api/v1/auth/register', userData);
      toast.success('Registration successful! Please log in.');
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Registration failed'
        : 'Registration failed';
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
    
    // Force a page reload
    window.location.reload();
  };

  // Check authentication status when the app loads
  useEffect(() => {
    checkAuthStatus();
  }, []);

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

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;