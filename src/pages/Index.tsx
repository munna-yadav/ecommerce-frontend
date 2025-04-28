import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Star, ArrowRight, User, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import axios from 'axios';
import { toast } from 'sonner';

// Define product interface based on API response
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number | null;
  image: string | null;
}

const Index = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const response = await axios.get('/api/v1/product/get');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products. Please try again later.');
      } finally {
        setProductsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Format price to display with currency symbol
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // Fallback image for products without images
  const fallbackImage = "https://via.placeholder.com/400x200?text=No+Image";

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 to-white">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 space-y-6">
              {isAuthenticated ? (
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900">
                  Welcome back, <span className="text-purple-600">{user?.name}</span>
                </h1>
              ) : (
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900">
                  Discover Amazing Products
                </h1>
              )}
              <p className="text-lg text-gray-600">
                {isAuthenticated 
                  ? "Continue shopping for the best deals and products tailored for you."
                  : "Shop the latest trends in electronics, fashion, and more. Get exclusive deals and premium quality products."
                }
              </p>
              <div className="flex gap-4">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Shop Now <ShoppingCart className="ml-2 h-5 w-5" />
                </Button>
                {isAuthenticated ? (
                  <Button variant="outline" onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-5 w-5" /> My Profile
                  </Button>
                ) : (
                  <Button variant="outline" asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                )}
              </div>
            </div>
            <div className="lg:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60"
                alt="Hero"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations Section - Only for authenticated user */}
      {isAuthenticated && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">Recommendations for You</h2>
            <p className="text-gray-600 mb-8">Based on your shopping history and preferences</p>
            
            {productsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin mr-2" />
                <span className="text-gray-600">Loading recommendations...</span>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 4).map((product) => (
                  <Card 
                    key={product.id} 
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="relative h-40 bg-gray-100">
                      <img
                        src={product.image || fallbackImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackImage;
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-1" title={product.name}>
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-600 font-bold">{formatPrice(product.price)}</span>
                        <div className="flex items-center">
                          {/* Default rating of 4 stars since API doesn't provide ratings */}
                          {Array(4).fill(0).map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No recommendations available at the moment.</p>
              </div>
            )}
            
            <div className="text-center mt-8">
              <Button variant="link" className="text-purple-600">
                View all recommendations <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          
          {productsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin mr-2" />
              <span className="text-gray-600">Loading products...</span>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <Card 
                  key={product.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={product.image || fallbackImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackImage;
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2" title={product.description}>
                      {product.description || "No description available"}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-600 font-bold">{formatPrice(product.price)}</span>
                      <div className="flex items-center">
                        {/* Default rating of 4 stars since API doesn't provide ratings */}
                        {Array(4).fill(0).map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between mt-4">
                      <span className={`text-sm ${product.quantity && product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.quantity && product.quantity > 0 ? `In Stock (${product.quantity})` : 'Out of Stock'}
                      </span>
                    </div>
                    <Button 
                      className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                      disabled={!product.quantity || product.quantity <= 0}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation to product detail
                        addToCart(product.id);
                      }}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Free Shipping",
                description: "On orders over $50",
                icon: "🚚",
              },
              {
                title: "24/7 Support",
                description: "Always here to help",
                icon: "💬",
              },
              {
                title: "Money Back",
                description: "30-day guarantee",
                icon: "💰",
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="text-center p-6 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
