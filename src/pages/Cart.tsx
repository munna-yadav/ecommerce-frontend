import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Cart = () => {
  const { 
    cartItems, 
    cartTotal, 
    cartCount, 
    isLoading: isCartLoading,
    removeFromCart, 
    updateQuantity
  } = useCart();
  
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const initialLoadDone = useRef(false);
  
  // State for removal confirmation dialog
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{id: number, name: string} | null>(null);
  
  // Currency formatter
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };
  
  // Remove manual fetch calls to avoid infinite loops
  // The CartContext will handle fetching based on authentication state

  // Handle removing item from cart with confirmation
  const handleRemoveItem = async (productId: number, productName: string) => {
    setItemToRemove({id: productId, name: productName});
    setShowRemoveDialog(true);
  };
  
  // Confirm removal of item from cart
  const confirmRemoveItem = async () => {
    if (itemToRemove) {
      await removeFromCart(itemToRemove.id);
      setShowRemoveDialog(false);
      setItemToRemove(null);
    }
  };

  // Handle quantity updates with validation
  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > 10) {
      toast.error("Maximum quantity allowed is 10");
      return;
    }
    
    await updateQuantity(productId, newQuantity);
  };

  // Process checkout
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setProcessingCheckout(true);
    
    try {
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please sign in to checkout');
        navigate('/auth');
        return;
      }
      
      console.log('Processing checkout...');
      
      // Using the correct endpoint /cart/checkout with GET method
      const response = await axios.get('/api/v1/cart/checkout', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Checkout response:', response.data);
      
      // Extract order ID if available in the response
      const orderId = response.data?.orderId || response.data?.id || null;
      
      toast.success('Order placed successfully!');
      
      // Navigate to checkout success page with order ID
      if (orderId) {
        navigate(`/checkout-success?orderId=${orderId}`);
      } else {
        // If no orderId is available, still navigate to the success page
        navigate('/checkout-success');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Failed to process checkout');
    } finally {
      setProcessingCheckout(false);
    }
  };

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking your login status...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm mb-6">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
            <p className="text-gray-600 mb-6">
              Please sign in to view your cart and continue shopping.
            </p>
            <Button onClick={() => navigate('/auth')} className="bg-purple-600 hover:bg-purple-700">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while fetching cart
  if (isCartLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 flex items-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            <ShoppingCart className="h-8 w-8 mr-3" /> Your Shopping Cart
          </h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/80 backdrop-blur-sm p-12 rounded-2xl shadow-lg max-w-md mx-auto transform transition-all duration-300 hover:scale-105">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="h-10 w-10 text-purple-600" />
                </div>
                <h2 className="text-2xl font-semibold mb-3">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <Button 
                  onClick={() => navigate('/products')} 
                  className="bg-purple-600 hover:bg-purple-700 px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:shadow-lg"
                >
                  Start Shopping
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart Items */}
              <div className="lg:w-2/3">
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                      <h2 className="text-xl font-semibold">Items ({cartCount})</h2>
                      <span className="text-sm text-gray-500">Price</span>
                    </div>
                    
                    {/* Cart Items List */}
                    <div className="space-y-6">
                      {cartItems.map((item) => (
                        <div 
                          key={item.productId} 
                          className="group flex flex-col sm:flex-row items-start sm:items-center py-6 border-b border-gray-100 last:border-0 gap-6 transition-all duration-300 hover:bg-gray-50/50 rounded-lg p-4"
                        >
                          {/* Product image */}
                          <div className="w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                            {item.image ? (
                              <img 
                                src={item.image}
                                alt={item.product}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                  if (!(e.target as HTMLImageElement).dataset.tried) {
                                    (e.target as HTMLImageElement).dataset.tried = "1";
                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                <ShoppingCart className="h-8 w-8" />
                              </div>
                            )}
                          </div>
                          
                          {/* Product details */}
                          <div className="flex-grow">
                            <h3 className="font-medium text-gray-900 text-lg mb-2">{item.product}</h3>
                            <p className="text-sm text-gray-500 mb-4">Unit Price: {formatPrice(item.price)}</p>
                            
                            {/* Quantity controls */}
                            <div className="flex items-center gap-3">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-9 w-9 rounded-full hover:bg-purple-50 hover:text-purple-600 transition-colors"
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                disabled={isCartLoading}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-9 w-9 rounded-full hover:bg-purple-50 hover:text-purple-600 transition-colors"
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                disabled={isCartLoading}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Price and remove button */}
                          <div className="flex flex-col items-end gap-4">
                            <span className="text-lg font-semibold text-purple-600">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleRemoveItem(item.productId, item.product)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:w-1/3">
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg sticky top-8">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                      <div className="border-t border-gray-100 pt-4 flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-purple-600">{formatPrice(cartTotal)}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg rounded-xl transition-all duration-300 hover:shadow-lg"
                      onClick={handleCheckout}
                      disabled={processingCheckout || cartItems.length === 0}
                    >
                      {processingCheckout ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Checkout
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full mt-4 text-gray-600 hover:text-gray-900"
                      onClick={() => navigate('/products')}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Continue Shopping
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Remove Item Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {itemToRemove?.name} from your cart?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveItem}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Cart;