import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import axios from 'axios';

interface OrderDetails {
  id: number;
  orderNumber?: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  items?: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { fetchCart } = useCart();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);

  // Get orderId from URL query parameters
  const orderId = new URLSearchParams(location.search).get('orderId');

  // Format currency
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Fetch updated cart (which should be empty) instead of manually clearing it
  useEffect(() => {
    if (isAuthenticated) {
      // Refresh the cart state to reflect that it's now empty
      fetchCart();
      
      // If we have an orderId, fetch order details
      if (orderId) {
        const fetchOrderDetails = async () => {
          try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/v1/orders/${orderId}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            setOrderDetails(response.data);
          } catch (error) {
            console.error('Failed to fetch order details:', error);
          } finally {
            setIsLoadingOrder(false);
          }
        };
        
        fetchOrderDetails();
      } else {
        setIsLoadingOrder(false);
      }
    }
  }, [isAuthenticated, fetchCart, orderId]);

  // Show loading state
  if (isLoading || isLoadingOrder) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto">
        <Card className="border-green-100 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for your purchase. Your order has been successfully placed.
              </p>
              
              {/* Order details summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <p className="text-gray-600 mb-4">
                  We've sent a confirmation email with all the details of your order.
                </p>
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <p className="flex justify-between mb-2">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium">
                      {orderDetails?.orderNumber || orderDetails?.id || 
                        (orderId ? `#${orderId}` : Math.floor(Math.random() * 1000000).toString().padStart(6, '0'))}
                    </span>
                  </p>
                  <p className="flex justify-between mb-2">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium">
                      {orderDetails?.createdAt 
                        ? new Date(orderDetails.createdAt).toLocaleDateString() 
                        : new Date().toLocaleDateString()}
                    </span>
                  </p>
                  {orderDetails?.totalAmount && (
                    <p className="flex justify-between mb-2">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium">{formatPrice(orderDetails.totalAmount)}</span>
                    </p>
                  )}
                  <p className="flex justify-between mb-2">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">
                      {orderDetails?.status || 'Confirmed'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center"
                  asChild
                >
                  <Link to="/">
                    Continue Shopping
                  </Link>
                </Button>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 flex items-center justify-center"
                  asChild
                >
                  {orderId ? (
                    <Link to={`/orders/${orderId}`}>
                      View Order Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  ) : (
                    <Link to="/orders">
                      View My Orders <ShoppingBag className="ml-2 h-4 w-4" />
                    </Link>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutSuccess;