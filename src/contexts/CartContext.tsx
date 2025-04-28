import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

// Updated cart item interface to match the API response
interface CartItem {
  product: string;
  productId: number;
  quantity: number;
  price: number;
  totalPrice: number;
}

// Define cart context interface
interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>; // Expose fetchCart method
  cartTotal: number;
  cartCount: number;
}

// Create the context with default values
const CartContext = createContext<CartContextType>({
  cartItems: [],
  isLoading: false,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  fetchCart: async () => {}, // Default fetchCart method
  cartTotal: 0,
  cartCount: 0,
});

// Export custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Cart provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartTotal, setCartTotal] = useState(0);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Calculate cart item count with safeguards
  const cartCount = Array.isArray(cartItems)
    ? cartItems.reduce((count, item) => count + item.quantity, 0)
    : 0;

  // Fetch cart items from API
  const fetchCart = async () => {
    if (!isAuthenticated || authLoading) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get('/api/v1/cart/get');
      
      // Log the response for debugging
      console.log('Cart API response:', response.data);
      
      // Extract the cart array and totalAmount from the response
      const cartData = response.data.cart || [];
      const totalAmount = response.data.totalAmount || 0;
      
      // Ensure we always set an array, even if the API returns unexpected structure
      setCartItems(Array.isArray(cartData) ? cartData : []);
      setCartTotal(totalAmount);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
      setCartTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cart when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
      setCartTotal(0);
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  // Add item to cart
  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart');
      return;
    }

    try {
      // Using POST with query parameters as expected by the API
      await axios.post(`/api/v1/cart/add?productId=${productId}&quantity=${quantity}`);
      toast.success('Item added to cart');
      fetchCart(); // Refresh cart after adding item
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: number) => {
    try {
      // Using DELETE method instead of GET for removing items from cart
      await axios.delete(`/api/v1/cart/delete-item?productId=${productId}`);
      toast.success('Item removed from cart');
      fetchCart(); // Refresh cart after removing item
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  // Update item quantity in cart
  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    try {
      // First remove the item using DELETE method
      await axios.delete(`/api/v1/cart/delete-item?productId=${productId}`);
      // Then add it back with the new quantity using POST method
      await axios.post(`/api/v1/cart/add?productId=${productId}&quantity=${quantity}`);
      fetchCart(); // Refresh cart after updating
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update item quantity');
    }
  };

  // Clear the entire cart
  const clearCart = async () => {
    try {
      // Make sure cartItems is an array before attempting to map
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        setCartItems([]);
        setCartTotal(0);
        return;
      }
      
      // Use DELETE method for each item in the cart
      const promises = cartItems.map(item => 
        axios.delete(`/api/v1/cart/delete-item?productId=${item.productId}`)
      );
      await Promise.all(promises);
      setCartItems([]);
      setCartTotal(0);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        fetchCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;