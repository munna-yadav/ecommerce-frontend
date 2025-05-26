import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, Mail, ShoppingBag, LogOut, Edit, Package, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    username: '',
    email: '',
    image: '',
    role: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('/api/v1/user/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const userData = response.data;
        setUser(userData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load profile. Please try again.');
        setIsLoading(false);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/v1/user/orders', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Log the response to understand its structure
        console.log("Orders response:", response.data);
        
        // Check if response.data is an array, if not, look for orders property
        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else if (response.data && Array.isArray(response.data.orders)) {
          // If orders are nested in an 'orders' property
          setOrders(response.data.orders);
        } else if (response.data && typeof response.data === 'object') {
          // If response is an object but not an array, convert to array if possible
          console.warn("Orders response is not an array, attempting to convert", response.data);
          const ordersArray = Object.values(response.data);
          setOrders(Array.isArray(ordersArray) ? ordersArray : []);
        } else {
          // Fallback to empty array if unable to parse
          console.error("Could not parse orders data, defaulting to empty array");
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      }
    };

    fetchUserProfile();
    fetchOrders();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          My Profile
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg overflow-hidden">
              {/* Header Banner */}
              <div className="relative h-40 bg-gradient-to-r from-purple-500 to-pink-500">
                <div className="absolute inset-0 bg-black/10" />
              </div>

              {/* Profile Content */}
              <div className="px-6 pb-6 relative">
                {/* Profile Image Container */}
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-10">
                  {user.image ? (
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                      <img 
                        src={user.image} 
                        alt={`${user.name}'s profile`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.classList.add('bg-purple-100');
                          const icon = document.createElement('div');
                          icon.className = 'flex justify-center items-center h-full';
                          icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-600"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
                          e.currentTarget.parentElement?.appendChild(icon);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="h-16 w-16 text-purple-600" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="pt-20 text-center">
                  <h2 className="text-2xl font-semibold mb-1">{user.name}</h2>
                  <p className="text-gray-500 text-sm mb-6">{user.role}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <User className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-gray-700">{user.username}</span>
                  </div>
                  <div className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <Mail className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-gray-700">{user.email}</span>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center hover:bg-purple-50 hover:text-purple-600 transition-colors" 
                    onClick={() => navigate('/profile/edit')}
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors" 
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Orders Section */}
          <div className="col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg">
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <ShoppingBag className="h-6 w-6 mr-2 text-purple-600" />
                  My Recent Orders
                </h2>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div 
                        key={order.id} 
                        className="group relative overflow-hidden rounded-xl border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">Order #{order.id}</h3>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-lg font-semibold text-purple-600">
                              ${order.totalAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Package className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              {order.items?.length || 0} items
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status === 'completed' && <CheckCircle2 className="h-4 w-4 mr-1" />}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShoppingBag className="h-10 w-10 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
                    <p className="text-gray-500 mb-6">
                      Start shopping to see your orders here
                    </p>
                    <Button 
                      onClick={() => navigate('/products')}
                      className="bg-purple-600 hover:bg-purple-700 px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:shadow-lg"
                    >
                      Start Shopping
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;