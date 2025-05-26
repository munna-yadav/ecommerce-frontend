import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  AlertCircle, 
  Package, 
  ChevronLeft, 
  Truck, 
  Clock, 
  Receipt, 
  MapPin,
  CreditCard,
  ShoppingBasket,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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

// Types
interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
  productId: number;
  imageUrl?: string;
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
  estimatedDeliveryDate?: string;
  trackingNumber?: string;
}

interface OrderTimeline {
  status: string;
  date: string;
  completed: boolean;
}

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
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

  // Generate a timeline based on order status
  const generateTimeline = (order: Order): OrderTimeline[] => {
    const timeline: OrderTimeline[] = [
      {
        status: 'Order Placed',
        date: order.orderDate,
        completed: true,
      },
      {
        status: 'Processing',
        date: addDaysToDate(order.orderDate, 1),
        completed: ['PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.status),
      },
      {
        status: 'Shipped',
        date: addDaysToDate(order.orderDate, 2),
        completed: ['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(order.status),
      },
      {
        status: 'Delivered',
        date: order.estimatedDeliveryDate || addDaysToDate(order.orderDate, 5),
        completed: ['DELIVERED', 'COMPLETED'].includes(order.status),
      }
    ];
    
    return timeline;
  };

  // Helper to add days to a date
  const addDaysToDate = (dateString: string, days: number): string => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString();
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string): string => {
    switch(status.toUpperCase()) {
      case 'COMPLETED':
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Fetch the order details from API
  useEffect(() => {
    const fetchOrder = async () => {
      if (!isAuthenticated || !orderId) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(`/api/v1/user/orders/${orderId}`);
        
        console.log('Order details response:', response.data);
        
        // Set the order data from the API
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, isAuthenticated]);

  // Handle order cancellation
  const handleCancelOrder = async () => {
    if (!order) return;
    
    setIsCancelling(true);
    
    try {
      await axiosInstance.delete(`/api/v1/user/delete-order/${order.id}`);
      toast.success('Order cancelled successfully');
      navigate('/orders');
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cancel order';
      toast.error(errorMessage);
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
    }
  };

  // Track package link - mock function for demonstration
  const trackPackage = () => {
    if (order?.trackingNumber) {
      // In a real application, this would link to the shipping carrier's tracking page
      window.open(`https://tracking.example.com/${order.trackingNumber}`, '_blank');
    } else {
      toast.info('Tracking information is not yet available for this order');
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
              Please sign in to view your order details.
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
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-red-50 p-6 rounded-lg border border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">Error</h2>
          </div>
          <p className="text-gray-700">{error || "Order not found"}</p>
          <div className="mt-4 space-x-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/orders')}
            >
              Back to Orders
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const timeline = generateTimeline(order);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/orders">Orders</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Order #{order.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-3" 
            onClick={() => navigate('/orders')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Order Details 
            <Badge className={getStatusBadgeClass(order.status)}>
              {order.status}
            </Badge>
          </h1>
        </div>
        <div>
          {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={() => setShowCancelDialog(true)}
            >
              Cancel Order
            </Button>
          )}
          {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
            <Button 
              className="flex items-center gap-2"
              onClick={trackPackage}
            >
              <Truck className="h-4 w-4" />
              Track Package
            </Button>
          )}
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex justify-between items-center">
                <CardTitle>Order Summary</CardTitle>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Placed on</div>
                  <div className="font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(order.orderDate)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Information */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Shipping Address
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3 border text-gray-700">
                    {order.shippingAddress || 'Address not provided'}
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />
                    Payment Method
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3 border text-gray-700">
                    <p className="capitalize">{order.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-1">
                  <ShoppingBasket className="h-4 w-4" />
                  Order Items
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <ul className="divide-y">
                    {order.orderItems?.map((item) => (
                      <li key={item.id} className="p-4 flex items-center gap-4">
                        <div className="h-16 w-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl}
                              alt={item.productName}
                              className="object-cover h-full w-full rounded"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-grow">
                          <Link 
                            to={`/products/${item.productId}`} 
                            className="font-medium hover:text-purple-600 transition-colors"
                          >
                            {item.productName}
                          </Link>
                          <p className="text-sm text-gray-600">
                            {item.quantity} {item.quantity > 1 ? 'items' : 'item'} × {formatPrice(item.price)}
                          </p>
                        </div>

                        <div className="font-medium text-right">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Order Total */}
              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-purple-600">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Timeline */}
        <div>
          <Card>
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {timeline.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="mt-1">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? "bg-green-100 text-green-600" 
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        {step.completed 
                          ? <CheckCircle className="h-4 w-4" /> 
                          : <div className="h-2 w-2 rounded-full bg-current"></div>}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="ml-3 h-10 border-l border-dashed border-gray-200"></div>
                      )}
                    </div>

                    <div>
                      <p className="font-medium">{step.status}</p>
                      <p className="text-sm text-gray-500">{formatDate(step.date)}</p>
                      
                      {step.status === 'Delivered' && step.completed && (
                        <div className="mt-2">
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1 mt-1">
                            <CheckCircle className="h-3 w-3" /> 
                            Completed
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {order.status === 'CANCELLED' && (
                  <div className="flex gap-4">
                    <div className="mt-1">
                      <div className="h-6 w-6 rounded-full flex items-center justify-center bg-red-100 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Order Cancelled</p>
                      <p className="text-sm text-gray-500">Order has been cancelled</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional tracking information */}
              {order.trackingNumber && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium mb-2">Tracking Information</h4>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm flex items-center justify-between">
                    <span>Tracking Number: {order.trackingNumber}</span>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={trackPackage}
                    >
                      Track
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Download Receipt Button */}
      {order.status !== 'CANCELLED' && (
        <div className="text-center">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 mx-auto"
          >
            <Receipt className="h-4 w-4" />
            Download Receipt
          </Button>
        </div>
      )}

      {/* Cancel Order Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel your order and initiate a refund if payment was made. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Order'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderDetail;