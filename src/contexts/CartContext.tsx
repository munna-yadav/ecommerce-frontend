import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  image?: string; // Add optional image property
}

// Define cart context interface
interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
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
  fetchCart: async () => {},
  cartTotal: 0,
  cartCount: 0,
});

// Export custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Cart provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Use refs to prevent infinite loops
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const cartInitializedRef = useRef(false);
  
  // Calculate cart item count with safeguards
  const cartCount = Array.isArray(cartItems)
    ? cartItems.reduce((count, item) => count + item.quantity, 0)
    : 0;

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    };
  };

  // Fetch cart items from API with debounce and loop prevention
  const fetchCart = useCallback(async () => {
    // Don't fetch if:
    // 1. User isn't authenticated
    // 2. Auth is still loading
    // 3. We're already fetching
    // 4. We've fetched in the last 500ms (debounce)
    if (!isAuthenticated || authLoading || 
        isFetchingRef.current || 
        Date.now() - lastFetchTimeRef.current < 500) {
      return;
    }
    
    isFetchingRef.current = true;
    setIsLoading(true);
    
    try {
      console.log('Fetching cart data...');
      // Use auth headers for cart fetch
      const response = await axios.get('/api/v1/cart/get', getAuthHeaders());
      lastFetchTimeRef.current = Date.now();
      
      // Log the response for debugging
      console.log('Cart API response:', response.data);
      
      // Extract the cart array and totalAmount from the response
      const cartData = response.data.cart || [];
      const totalAmount = response.data.totalAmount || 0;
      
      // Ensure we always set an array, even if the API returns unexpected structure
      setCartItems(Array.isArray(cartData) ? cartData : []);
      setCartTotal(totalAmount);
      cartInitializedRef.current = true;
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
      setCartTotal(0);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [isAuthenticated, authLoading]);

  // Only fetch cart once when authentication is confirmed
  useEffect(() => {
    if (isAuthenticated && !authLoading && !cartInitializedRef.current) {
      fetchCart();
    } else if (!isAuthenticated && !authLoading) {
      setCartItems([]);
      setCartTotal(0);
      cartInitializedRef.current = false;
    }
  }, [isAuthenticated, authLoading, fetchCart]);

  // Add item to cart
  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart');
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Adding product ID ${productId} with quantity ${quantity} to cart`);
      // Using POST with query parameters as expected by the API
      await axios.post(`/api/v1/cart/add?productId=${productId}&quantity=${quantity}`, {}, getAuthHeaders());
      toast.success('Item added to cart');
      await fetchCart();
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: number): Promise<void> => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      console.log(`Removing product ID ${productId} from cart`);
      // Using the correct endpoint /cart/delete-item with request param
      await axios.delete(`/api/v1/cart/delete-item?productId=${productId}`, getAuthHeaders());
      toast.success('Item removed from cart');
      await fetchCart();
    } catch (error: any) {
      console.error('Error removing item from cart:', error);
      toast.error(error.response?.data?.message || 'Failed to remove item');
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: number, quantity: number): Promise<void> => {
    if (!isAuthenticated || quantity < 1) return;

    setIsLoading(true);
    try {
      console.log(`Updating product ID ${productId} quantity to ${quantity}`);
      // Try both potential API formats
      try {
        // First attempt - using PUT with path parameter and query parameter
        await axios.put(`/api/v1/cart/update/${productId}?quantity=${quantity}`, {}, getAuthHeaders());
      } catch (firstError) {
        console.log('First update attempt failed, trying alternative endpoint format');
        // Second attempt - using PUT with query parameters only
        await axios.put(`/api/v1/cart/update?productId=${productId}&quantity=${quantity}`, {}, getAuthHeaders());
      }
      
      await fetchCart();
    } catch (error: any) {
      console.error('Error updating item quantity:', error);
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear the entire cart
  const clearCart = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      console.log('Clearing cart');
      await axios.delete('/api/v1/cart/clear', getAuthHeaders());
      setCartItems([]);
      setCartTotal(0);
      toast.success('Cart cleared');
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      toast.error(error.response?.data?.message || 'Failed to clear cart');
    } finally {
      setIsLoading(false);
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