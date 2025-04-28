import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ShoppingCart, 
  Star, 
  Loader2, 
  Filter, 
  SlidersHorizontal, 
  X
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import axios from 'axios';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Define product interface
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity?: number;
  image?: string;
  category?: string;
}

const Products = () => {
  // State for all products and filtered products
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Filtering and sorting states
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fallback image for products without images
  const fallbackImage = "https://via.placeholder.com/300x200?text=No+Image";

  // Format price to display with currency symbol
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // Fetch all products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all products from the backend endpoint
        const response = await axios.get('/api/v1/product/get');
        
        if (response.data && Array.isArray(response.data)) {
          setAllProducts(response.data);
        } else {
          setAllProducts([]);
          setError('Unexpected API response format');
        }

        // Extract unique categories from products
        const uniqueCategories = Array.from(
          new Set(
            response.data
              .filter((product: Product) => product.category)
              .map((product: Product) => product.category)
          )
        );
        setCategories(uniqueCategories as string[]);
        
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Apply filters, sorting, and search on the client side
  useEffect(() => {
    // Get filter parameters from URL
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const sort = searchParams.get('sort') || sortBy;
    const minPrice = parseFloat(searchParams.get('minPrice') || priceRange[0].toString());
    const maxPrice = parseFloat(searchParams.get('maxPrice') || priceRange[1].toString());
    
    setCurrentPage(page);
    setSortBy(sort);
    setPriceRange([minPrice, maxPrice]);
    
    if (category) {
      const categoriesArray = category.split(',');
      setSelectedCategories(categoriesArray);
    } else {
      setSelectedCategories([]);
    }
    
    // Apply filtering and sorting
    let result = [...allProducts];
    
    // Filter by category
    if (category) {
      const categoriesArray = category.split(',');
      result = result.filter(product => 
        product.category && categoriesArray.includes(product.category)
      );
    }
    
    // Filter by price range
    result = result.filter(product => 
      product.price >= minPrice && product.price <= maxPrice
    );
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return b.id - a.id; // Assuming higher ids are newer
        case 'oldest':
          return a.id - b.id;
        case 'price_low_high':
          return a.price - b.price;
        case 'price_high_low':
          return b.price - a.price;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
    
    setFilteredProducts(result);
  }, [searchParams, allProducts, sortBy, priceRange]);

  // Calculate the total number of pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / itemsPerPage);
  }, [filteredProducts, itemsPerPage]);

  // Get current products for display based on pagination
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);
  
  // Handle adding item to cart with confirmation
  const handleAddToCart = async (productId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation to product detail
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };
  
  // Update URL with new filters
  const updateFilters = (filters: Record<string, any>) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Update or remove each filter parameter
    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === '' || value === undefined) {
        newParams.delete(key);
      } else {
        newParams.set(key, value.toString());
      }
    });
    
    // Always reset to page 1 when filtering changes
    if (Object.keys(filters).some(key => key !== 'page')) {
      newParams.set('page', '1');
    }
    
    setSearchParams(newParams);
  };
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateFilters({ sort: value });
  };
  
  // Handle price range change
  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    // Don't update URL immediately for slider to avoid too many updates
  };
  
  // Apply price range filter (called when slider interaction ends)
  const applyPriceRange = () => {
    updateFilters({ minPrice: priceRange[0], maxPrice: priceRange[1] });
  };
  
  // Handle category selection
  const handleCategoryChange = (category: string, checked: boolean) => {
    const updatedCategories = checked 
      ? [...selectedCategories, category]
      : selectedCategories.filter(c => c !== category);
    
    setSelectedCategories(updatedCategories);
    
    if (updatedCategories.length === 0) {
      updateFilters({ category: null });
    } else {
      updateFilters({ category: updatedCategories.join(',') });
    }
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  
  // Clear all filters
  const clearFilters = () => {
    setSortBy('newest');
    setPriceRange([0, 100000]);
    setSelectedCategories([]);
    setSearchParams(new URLSearchParams({ sort: 'newest' }));
  };

  // Generate pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const showFirst = currentPage > 3;
    const showLast = currentPage < totalPages - 2;
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (showFirst) {
      pages.push(
        <Button 
          key="first" 
          variant="outline" 
          size="sm" 
          onClick={() => handlePageChange(1)}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots1" className="px-2">...</span>);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button 
          key={i} 
          variant={i === currentPage ? "default" : "outline"}
          size="sm" 
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }
    
    if (showLast) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots2" className="px-2">...</span>);
      }
      pages.push(
        <Button 
          key="last" 
          variant="outline" 
          size="sm" 
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }
    
    return (
      <div className="flex justify-center mt-8 space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="flex items-center space-x-2">
          {pages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  // Filter sidebar content - shared between desktop and mobile
  const filterContent = (
    <div className="space-y-6">
           
      <div>
        <h3 className="font-medium mb-4">Price Range</h3>
        <div className="space-y-6">
          <Slider
            defaultValue={priceRange}
            min={0}
            max={100000}
            step={1000}
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            onValueCommit={applyPriceRange}
          />
          <div className="flex items-center justify-between">
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value)) {
                  setPriceRange([value, priceRange[1]]);
                }
              }}
              onBlur={applyPriceRange}
              className="w-[45%]"
            />
            <span>to</span>
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value)) {
                  setPriceRange([priceRange[0], value]);
                }
              }}
              onBlur={applyPriceRange}
              className="w-[45%]"
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="font-medium mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => 
                  handleCategoryChange(category, checked === true)
                }
              />
              <Label
                htmlFor={`category-${category}`}
                className="ml-2 text-sm font-normal cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <Button
        variant="outline"
        className="w-full"
        onClick={clearFilters}
      >
        <X className="h-4 w-4 mr-2" />
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">All Products</h1>
      
      {/* Filters and Sorting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mb-4 md:mb-0">
          {/* Mobile filter button */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <SheetHeader className="mb-6">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              {filterContent}
            </SheetContent>
          </Sheet>
          
          {/* Sort dropdown */}
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[200px]">
              <span className="flex items-center">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price_low_high">Price: Low to High</SelectItem>
              <SelectItem value="price_high_low">Price: High to Low</SelectItem>
              <SelectItem value="name_asc">Name (A-Z)</SelectItem>
              <SelectItem value="name_desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-gray-500">
          {filteredProducts.length > 0 ? (
            <span>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)}-
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
            </span>
          ) : !isLoading ? (
            <span>No products found</span>
          ) : null}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden md:block w-64 space-y-6">
          <div className="sticky top-24">
            <h2 className="text-xl font-bold mb-6">Filters</h2>
            {filterContent}
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin mr-2" />
              <span className="text-gray-600">Loading products...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-800">
              <p>{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : currentProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentProducts.map((product) => (
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
                      {product.category && (
                        <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                          {product.category}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1" title={product.name}>
                        {product.name}
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-2 text-sm" title={product.description}>
                        {product.description || "No description available"}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-600 font-bold">{formatPrice(product.price)}</span>
                        <div className="flex items-center">
                          {/* Default rating of 4 stars since API doesn't provide ratings */}
                          {Array(4).fill(0).map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className={`text-sm ${product.quantity && product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.quantity && product.quantity > 0 ? `In Stock (${product.quantity})` : 'Out of Stock'}
                        </span>
                      </div>
                      <Button 
                        className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                        onClick={(e) => handleAddToCart(product.id, e)}
                        disabled={!product.quantity || product.quantity <= 0}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {renderPagination()}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 p-8 rounded-lg max-w-md mx-auto">
                <h2 className="text-xl font-bold mb-2">No products found</h2>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear all filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;