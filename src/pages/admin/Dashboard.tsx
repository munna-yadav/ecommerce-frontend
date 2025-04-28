import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Package, 
  TrendingUp,
  Settings,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Fetch dashboard statistics
  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, you would fetch actual stats from your backend
        // For now, we'll use sample data and fetch product count
        const productsResponse = await axios.get('/api/v1/product/get');
        
        setStats({
          totalProducts: productsResponse.data.length,
          totalOrders: 158, // Sample data
          totalUsers: 723,  // Sample data
          totalRevenue: 284750.50 // Sample data
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [navigate, user]);

  // Admin menu items
  const menuItems = [
    {
      title: 'Product Management',
      description: 'Add, edit, or remove products from your store',
      icon: <Package className="h-8 w-8 text-purple-600" />,
      path: '/admin/products'
    },
    {
      title: 'Order Management',
      description: 'View and process customer orders',
      icon: <ShoppingBag className="h-8 w-8 text-green-600" />,
      path: '/admin/orders'
    },
    {
      title: 'User Management',
      description: 'Manage customer accounts and permissions',
      icon: <Users className="h-8 w-8 text-blue-600" />,
      path: '/admin/users'
    },
    {
      title: 'Store Settings',
      description: 'Configure store policies and appearance',
      icon: <Settings className="h-8 w-8 text-gray-600" />,
      path: '/admin/settings'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center mb-8">
        <ShieldCheck className="h-8 w-8 text-purple-600 mr-2" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <h3 className="text-2xl font-bold mt-1">{isLoading ? '...' : stats.totalProducts}</h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <h3 className="text-2xl font-bold mt-1">{isLoading ? '...' : stats.totalOrders}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ShoppingBag className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold mt-1">{isLoading ? '...' : stats.totalUsers}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">{isLoading ? '...' : formatCurrency(stats.totalRevenue)}</h3>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Menu */}
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {menuItems.map((item, index) => (
          <Card 
            key={index} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(item.path)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="p-4 mb-4">
                {item.icon}
              </div>
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity (Placeholder) */}
      <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
      <Card>
        <CardHeader>
          <CardTitle>Store Activity</CardTitle>
          <CardDescription>Recent orders, products, and customer activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Activity dashboard will be implemented in future updates.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;