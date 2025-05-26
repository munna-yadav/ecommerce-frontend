import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Index from '../pages/Index';
import Auth from '../pages/Auth'; 
import Profile from '../pages/Profile';
import EditProfile from '../pages/EditProfile'; 
import Cart from '../pages/Cart'; 
import Orders from '../pages/Orders'; 
import OrderDetail from '../pages/OrderDetail';
import Products from '../pages/Products'; 
import CheckoutSuccess from '../pages/CheckoutSuccess';
import Navbar from '../components/layout/Navbar';
import SearchResults from '../pages/SearchResults.tsx'; 
import ProductDetail from '../pages/ProductDetail.tsx';
import AdminDashboard from '../pages/admin/Dashboard'; 
import ProductManagement from '../pages/admin/ProductManagement';
import NotFound from '../pages/NotFound'; // Import NotFound component

// A protected route component that redirects to login if user is not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Important: Show loading state during authentication check
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to auth page with return URL
  if (!isAuthenticated) {
    // Store the current path to redirect back after login
    return <Navigate to={`/auth?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  // If authenticated, render the children
  return <>{children}</>;
};

// Simple layout component that includes the Navbar
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><Index /></Layout>} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/login" element={<Navigate to="/auth?tab=login" replace />} />
      <Route path="/register" element={<Navigate to="/auth?tab=register" replace />} />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/edit" 
        element={
          <ProtectedRoute>
            <Layout><EditProfile /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/products" 
        element={<Layout><Products /></Layout>} 
      />
      <Route 
        path="/search" 
        element={<Layout><SearchResults /></Layout>} 
      />
      <Route 
        path="/product/:id" 
        element={<Layout><ProductDetail /></Layout>} 
      />
      <Route 
        path="/cart" 
        element={
          <ProtectedRoute>
            <Layout><Cart /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute>
            <Layout><Orders /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders/:id" 
        element={
          <ProtectedRoute>
            <Layout><OrderDetail /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/checkout-success" 
        element={
          <ProtectedRoute>
            <Layout><CheckoutSuccess /></Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* Admin routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <Layout><AdminDashboard /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/products" 
        element={
          <ProtectedRoute>
            <Layout><ProductManagement /></Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* 404 route */}
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  );
};

export default AppRoutes;