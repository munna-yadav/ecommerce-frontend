import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

// Updated interface to match the API response structure
interface CartItem {
  product: string;
  productId: number;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface ProductImage {
  [productId: number]: string;
}

const Cart = () => {
  const { cartItems, isLoading, removeFromCart, updateQuantity, cartTotal, fetchCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage>({});
  const [loadingImages, setLoadingImages] = useState(false);

  // Calculate cart count from the items
  const cartCount = Array.isArray(cartItems) ? cartItems.reduce((count, item) => count + item.quantity, 0) : 0;

  // Fetch product images for cart items that don't have images
  useEffect(() => {
    const fetchProductImages = async () => {
      if (!Array.isArray(cartItems) || cartItems.length === 0) return;
      
      setLoadingImages(true);
      const productIds = cartItems.map(item => item.productId);
      const images: ProductImage = {};
      
      try {
        // Create an array of promises for fetching each product detail
        const productPromises = productIds.map(async (productId) => {
          try {
            const response = await axios.get(`/api/v1/product/${productId}`);
            if (response.data && response.data.image) {
              images[productId] = response.data.image;
            }
          } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
          }
        });
        
        await Promise.all(productPromises);
        setProductImages(images);
      } catch (error) {
        console.error('Error fetching product images:', error);
      } finally {
        setLoadingImages(false);
      }
    };
    
    fetchProductImages();
  }, [cartItems]);

  // Format price to display with currency symbol
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const handleIncreaseQuantity = async (productId: number, currentQuantity: number) => {
    await updateQuantity(productId, currentQuantity + 1);
  };

  const handleDecreaseQuantity = async (productId: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      await updateQuantity(productId, currentQuantity - 1);
    } else {
      await removeFromCart(productId);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    await removeFromCart(productId);
  };

  const handleCheckout = async () => {
    setProcessingCheckout(true);
    
    try {
      // Call the checkout API endpoint
      const response = await axios.get('/api/v1/cart/checkout');
      
      // Check if checkout was successful
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Checkout successful!');
        
        // Clear cart in context after successful checkout
        await fetchCart();
        
        // You can navigate to an order confirmation page here
        navigate('/checkout/success');
      } else {
        toast.error(response.data.message || 'Checkout failed. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout. Please try again later.');
    } finally {
      setProcessingCheckout(false);
    }
  };

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

  if (isLoading) {
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
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <ShoppingCart className="h-8 w-8 mr-3" /> Your Cart {cartCount > 0 && `(${cartCount} items)`}
      </h1>

      {!Array.isArray(cartItems) || cartItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm max-w-md mx-auto">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Button onClick={() => navigate('/products')} className="bg-purple-600 hover:bg-purple-700">
              Start Shopping
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row border-b border-gray-200 last:border-0 pb-4 mb-4 last:pb-0 last:mb-0">
                      <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-md overflow-hidden mb-4 sm:mb-0 sm:mr-4 flex-shrink-0">
                        {/* Use product image from API if available, otherwise show placeholder */}
                        {productImages[item.productId] ? (
                          <img
                            src={productImages[item.productId]}
                            alt={item.product}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = "https://via.placeholder.com/128?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {loadingImages ? (
                              <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                            ) : (
                              <span className="text-gray-400 text-sm">{item.product}</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex flex-wrap justify-between mb-2">
                          <Link to={`/product/${item.productId}`} className="text-lg font-semibold hover:text-purple-600">
                            {item.product} {/* Using product name from API */}
                          </Link>
                          <span className="font-bold text-purple-600">
                            {formatPrice(item.totalPrice)} {/* Using totalPrice from API */}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-4">
                          Unit Price: {formatPrice(item.price)}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border rounded">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-none"
                              onClick={() => handleDecreaseQuantity(item.productId, item.quantity)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-none"
                              onClick={() => handleIncreaseQuantity(item.productId, item.quantity)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveItem(item.productId)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            <span className="text-xs">Remove</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <Button 
                variant="outline" 
                className="flex items-center" 
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-24">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                      {/* Use the totalAmount from API via cartTotal in CartContext */}
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span>{formatPrice(cartTotal * 0.18)}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-purple-600">
                        {formatPrice(cartTotal + (cartTotal * 0.18))}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleCheckout}
                    disabled={processingCheckout}
                  >
                    {processingCheckout ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Proceed to Checkout 
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;