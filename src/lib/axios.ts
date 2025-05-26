import axios from 'axios';
import { toast } from 'sonner';

// Use relative URLs that will go through Vite's proxy
const axiosInstance = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Keep track of token refresh attempts to prevent infinite loops
let isRefreshing = false;

// List of endpoints that don't require authorization
const noAuthEndpoints = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
];

// Add a request interceptor to include auth token in all requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Check if the current request URL is in the noAuthEndpoints list
    const isAuthEndpoint = noAuthEndpoints.some(endpoint => 
      config.url && config.url.includes(endpoint)
    );
    
    // Log the request for debugging
    console.log('Request:', { 
      url: config.url, 
      method: config.method, 
      headers: { ...config.headers, Authorization: config.headers.Authorization ? 'Bearer [TOKEN]' : 'none' }
    });
    
    // Only add the authorization header if it's not an auth endpoint
    if (!isAuthEndpoint) {
      const token = localStorage.getItem('token');
      if (token) {
        // Always use Bearer token format
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful response for debugging
    console.log('Response success:', {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  async (error) => {
    // Don't log large response data to avoid console clutter
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data ? 'Error data available' : 'No error data'
    });
    
    // Get the original request config
    const originalRequest = error.config;
    
    if (error.response) {
      // Handle 401 Unauthorized errors (token expired, etc.)
      if (error.response.status === 401) {
        // Don't handle auth errors for auth endpoints
        const isAuthEndpoint = noAuthEndpoints.some(endpoint => 
          originalRequest.url && originalRequest.url.includes(endpoint)
        );

        if (!isAuthEndpoint && !isRefreshing) {
          // Prevent infinite loops
          isRefreshing = true;
          
          console.log("Authentication failed. Clearing token and redirecting to login...");
          localStorage.removeItem('token');
          
          // Notify user only once
          toast.error('Your session has expired. Please log in again.');
          
          // Use timeout to prevent immediate redirect that could interrupt UI
          setTimeout(() => {
            window.location.href = '/auth?tab=login';
            isRefreshing = false;
          }, 100);
        }
      }
      
      // Handle 415 Unsupported Media Type errors
      if (error.response.status === 415) {
        toast.error('Server cannot process this type of request. Please try again.');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;