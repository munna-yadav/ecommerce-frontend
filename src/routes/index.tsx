import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Index from '../pages/Index';
import Auth from '../pages/Auth'; // Import the unified Auth page
import Profile from '../pages/Profile';
import EditProfile from '../pages/EditProfile'; // Import the EditProfile page
import Cart from '../pages/Cart'; // Import the Cart page
import Orders from '../pages/Orders'; // Import the Orders page
import Products from '../pages/Products'; // Import the Products page
import CheckoutSuccess from '../pages/CheckoutSuccess'; // Import the CheckoutSuccess page
import Navbar from '../components/layout/Navbar';
import SearchResults from '../pages/SearchResults.tsx'; // Import the SearchResults page
import ProductDetail from '../pages/ProductDetail.tsx'; // Import the ProductDetail page
import AdminDashboard from '../pages/admin/Dashboard'; // Import the AdminDashboard page
import ProductManagement from '../pages/admin/ProductManagement'; // Import the ProductManagement page

// A protected route component that redirects to login if user is not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
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
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />; // Redirect to /auth instead of /login
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
      <Route path="/auth" element={<Auth />} /> {/* Unified auth page */}
      {/* Redirects for /login and /register to maintain backward compatibility */}
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
        path="/checkout/success" 
        element={
          <ProtectedRoute>
            <Layout><CheckoutSuccess /></Layout>
          </ProtectedRoute>
        } 
      />
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
      {/* Add more routes as needed */}
    </Routes>
  );
};

export default AppRoutes;