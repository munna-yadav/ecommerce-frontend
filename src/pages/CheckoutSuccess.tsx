import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, isLoading, navigate]);

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
                <p className="text-gray-600">
                  We've sent a confirmation email with all the details of your order.
                </p>
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <p className="flex justify-between mb-2">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium">{Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}</span>
                  </p>
                  <p className="flex justify-between mb-2">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </p>
                  <p className="flex justify-between mb-2">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">Credit Card</span>
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
                  <Link to="/profile">
                    View My Orders <ShoppingBag className="ml-2 h-4 w-4" />
                  </Link>
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