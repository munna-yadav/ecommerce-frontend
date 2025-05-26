import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PackageOpen, ShoppingCart, AlertCircle, MapPin, CreditCard } from 'lucide-react';
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
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/lib/axios';

// Updated order interface to match actual API response
interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  shippingAddress: string | null;
  paymentMethod: string;
  customerId: number;
  orderItems: OrderItem[];
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Format price to display with currency symbol
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Using our axiosInstance with automatic Bearer token
        const response = await axiosInstance.get('/api/v1/user/orders');
        
        console.log('Orders API response:', response.data);
        
        // Check if response.data is an array directly or if it's nested under an 'orders' property
        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else if (response.data && Array.isArray(response.data.orders)) {
          setOrders(response.data.orders);
        } else if (response.data && typeof response.data === 'object') {
          // Handle case where a single order is returned (not in an array)
          setOrders([response.data]);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again later.');
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  // Handle delete order
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    setIsDeleting(true);
    
    try {
      // Using axiosInstance that automatically includes the Bearer token
      await axiosInstance.delete(`/api/v1/user/delete-order/${orderToDelete}`);
      
      // Remove the deleted order from state
      setOrders(orders.filter(order => order.id !== orderToDelete));
      toast.success('Order deleted successfully');
      
    } catch (error: any) {
      console.error('Error deleting order:', error);
      
      // Show more detailed error from response if available
      const errorMessage = error.response?.data?.message || 'Failed to delete order';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setOrderToDelete(null);
    }
  };

  // Opens the confirmation dialog before deleting
  const openDeleteDialog = (orderId: number) => {
    setOrderToDelete(orderId);
    setShowDeleteDialog(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm mb-6">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
            <p className="text-gray-600 mb-6">
              Please sign in to view your orders.
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
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-red-50 p-6 rounded-lg border border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">Error</h2>
          </div>
          <p className="text-gray-700">{error}</p>
          <Button 
            className="mt-4 bg-red-600 hover:bg-red-700" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <div className="flex gap-4">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate('/cart')}>
            <ShoppingCart className="h-4 w-4" />
            <span>View Cart</span>
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 p-8 rounded-lg shadow-sm max-w-md mx-auto">
            <PackageOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to place your first order!
            </p>
            <Button onClick={() => navigate('/')} className="bg-purple-600 hover:bg-purple-700">
              Shop Now
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Order #{order.id}</div>
                    <CardTitle>Placed on {formatDate(order.orderDate)}</CardTitle>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                      <span className="font-bold text-lg text-purple-600">{formatPrice(order.totalAmount)}</span>
                    </div>
                    <div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium
                        ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : ''}
                        ${order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' : ''}
                        ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
                        ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                      `}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Order Items Summary */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b">
                      <h4 className="font-medium">Order Items</h4>
                    </div>
                    <div className="p-3">
                      <ul className="divide-y">
                        {order.orderItems?.map((item) => (
                          <li key={item.id} className="py-2 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-gray-600">
                                {item.quantity} {item.quantity > 1 ? 'items' : 'item'} × {formatPrice(item.price)}
                              </p>
                            </div>
                            <div className="font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Shipping Address</h4>
                        <p className="text-gray-600">{order.shippingAddress || 'Address not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <CreditCard className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Payment Method</h4>
                        <p className="text-gray-600 capitalize">{order.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t flex justify-between items-center">
                    <Button 
                      variant="link" 
                      className="p-0 text-purple-600 hover:text-purple-800"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      View Order Details
                    </Button>
                    
                    {order.status === 'COMPLETED' && (
                      <Button variant="outline" size="sm">
                        Track Package
                      </Button>
                    )}
                    
                    {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                      <Button 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        size="sm"
                        onClick={() => openDeleteDialog(order.id)}
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Delete Order Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel and Delete Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your order. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Order'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Orders;