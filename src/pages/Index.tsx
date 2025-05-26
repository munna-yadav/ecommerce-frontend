import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Star, ArrowRight, User, Loader2, Heart, Eye } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Category Showcase Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Electronics",
                description: "Latest gadgets and tech",
                icon: "💻",
                color: "from-blue-500 to-blue-600",
              },
              {
                title: "Fashion",
                description: "Trending styles",
                icon: "👕",
                color: "from-purple-500 to-purple-600",
              },
              {
                title: "Home & Living",
                description: "Make your space beautiful",
                icon: "🏠",
                color: "from-pink-500 to-pink-600",
              },
              {
                title: "Accessories",
                description: "Complete your look",
                icon: "👜",
                color: "from-indigo-500 to-indigo-600",
              },
            ].map((category) => (
              <div
                key={category.title}
                className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer"
                onClick={() => navigate(`/products?category=${category.title.toLowerCase()}`)}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative">
                  <div className="text-4xl mb-4 transform transition-transform duration-300 group-hover:scale-110">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                  <p className="text-gray-600 text-sm">{category.description}</p>
                  <div className="mt-4 flex items-center text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">Explore</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Featured Products
            </h2>
            <Button variant="ghost" className="text-purple-600 hover:text-purple-700">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {productsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin mr-2" />
              <span className="text-gray-600">Loading products...</span>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <Card 
                  key={product.id} 
                  className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-purple-200 transition-all duration-300 hover:shadow-xl"
                >
                  {/* Product Image Container */}
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={product.image || fallbackImage}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackImage;
                      }}
                    />
                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                      <Button 
                        variant="secondary" 
                        size="icon"
                        className="rounded-full bg-white/90 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${product.id}`);
                        }}
                      >
                        <Eye className="h-5 w-5 text-gray-700" />
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="icon"
                        className="rounded-full bg-white/90 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product.id);
                        }}
                      >
                        <ShoppingCart className="h-5 w-5 text-gray-700" />
                      </Button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-1" title={product.name}>
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2" title={product.description}>
                      {product.description || "No description available"}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-purple-600">{formatPrice(product.price)}</span>
                      <div className="flex items-center gap-1">
                        {Array(4).fill(0).map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${product.quantity && product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.quantity && product.quantity > 0 ? `In Stock (${product.quantity})` : 'Out of Stock'}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-purple-600 hover:text-purple-700"
                        disabled={!product.quantity || product.quantity <= 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product.id);
                        }}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        Wishlist
                      </Button>
                    </div>
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

      {/* Benefits Section - Modernized */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Free Shipping",
                description: "On orders over $50",
                icon: "🚚",
                gradient: "from-blue-500 to-blue-600",
              },
              {
                title: "24/7 Support",
                description: "Always here to help",
                icon: "💬",
                gradient: "from-purple-500 to-purple-600",
              },
              {
                title: "Money Back",
                description: "30-day guarantee",
                icon: "💰",
                gradient: "from-pink-500 to-pink-600",
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${benefit.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative">
                  <div className="text-4xl mb-4 transform transition-transform duration-300 group-hover:scale-110">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
