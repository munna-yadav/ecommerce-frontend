import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, Mail, ShoppingBag, LogOut, Edit } from 'lucide-react';
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
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
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
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              {user.image ? (
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-purple-100">
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
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-purple-600" />
                </div>
              )}
              <h2 className="text-xl font-semibold">{user.name}</h2>

            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <span>{user.username}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <span>{user.email}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center" 
                onClick={() => navigate('/profile/edit')}
              >
                <Edit className="h-5 w-5 mr-2" />
                Edit Profile
              </Button>
              <Button 
                variant="destructive" 
                className="w-full flex items-center justify-center" 
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </Card>
        </div>

        <div className="col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">My Recent Orders</h2>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="font-semibold">${order.totalAmount.toFixed(2)}</p>
                    </div>
                    <p className="mt-2 text-sm">Status: <span className="font-medium">{order.status}</span></p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">You haven't placed any orders yet</p>
                <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                  Start Shopping
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;