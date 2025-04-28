import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Star, Search, Loader2, Filter } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

// Define product interface
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number | null;
  image: string | null;
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch search results
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) {
        navigate('/');
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(`/api/v1/product/search?q=${encodeURIComponent(searchQuery)}`);
        setProducts(response.data);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Failed to load search results. Please try again.');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery, navigate]);

  // Format price to display with currency symbol
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Fallback image for products without images
  const fallbackImage = "https://via.placeholder.com/400x200?text=No+Image";

  // Sort products by price
  const sortedProducts = [...products].sort((a, b) => {
    return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
  });

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Search Results for "{searchQuery}"
        </h1>
        <p className="text-gray-600 mt-2">
          {products.length} products found
        </p>
      </div>

      {/* Sorting and Filtering Options */}
      <div className="flex flex-wrap items-center justify-between mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="mb-2 sm:mb-0">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-700 font-medium">Sort by:</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleSortOrder}
            className={sortOrder === 'asc' ? 'bg-purple-50 text-purple-700' : ''}
          >
            Price: {sortOrder === 'asc' ? 'Low to High' : 'High to Low'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Searching for products...</p>
          </div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <Card 
              key={product.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="h-48 bg-gray-100">
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
                <h3 className="font-semibold text-lg mb-2 line-clamp-1" title={product.name}>
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-3 text-sm line-clamp-2" title={product.description}>
                  {product.description || "No description available"}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-purple-600 font-bold">{formatPrice(product.price)}</span>
                  <div className="flex items-center">
                    {Array(4).fill(0).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <Button 
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                  disabled={!product.quantity || product.quantity <= 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.success(`${product.name} added to cart!`);
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No results found</h2>
          <p className="text-gray-500 mb-8">
            We couldn't find any products matching "{searchQuery}"
          </p>
          <Button onClick={() => navigate('/')}>
            Return to Homepage
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;