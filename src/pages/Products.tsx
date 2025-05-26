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
  X,
  Heart,
  Eye,
  ChevronLeft,
  ChevronRight
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
  quantity?: number; // Using quantity to match API response
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
        console.log('Fetching products for public display...');
        // Use relative path with proxy instead of absolute URL
        const response = await axios.get('/api/v1/product/get');
        
        console.log('Products API response:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          setAllProducts(response.data);
          console.log(`Successfully loaded ${response.data.length} products`);
          
          // Extract unique categories from products
          const uniqueCategories = Array.from(
            new Set(
              response.data
                .filter((product: Product) => product.category)
                .map((product: Product) => product.category)
            )
          );
          setCategories(uniqueCategories as string[]);
        } else {
          console.error('Unexpected API response format:', response.data);
          setAllProducts([]);
          setError('Unexpected API response format');
        }
      } catch (error: any) {
        console.error('Error fetching products:', error);
        
        // More detailed error logging
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
        }
        
        setError(`Failed to load products: ${error.message || 'Unknown error'}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Our Products
            </h1>
            <p className="text-gray-600 mt-2">
              Discover our curated collection of premium products
            </p>
          </div>

          {/* Sort and Filter Controls */}
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px] bg-white/80 backdrop-blur-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_low_high">Price: Low to High</SelectItem>
                <SelectItem value="price_high_low">Price: High to Low</SelectItem>
                <SelectItem value="name_asc">Name: A to Z</SelectItem>
                <SelectItem value="name_desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>

            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  {/* Mobile Filters Content */}
                  <div className="space-y-6">
                    {/* Categories */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Categories</h3>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={category}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={(checked) => 
                                handleCategoryChange(category, checked as boolean)
                              }
                            />
                            <Label htmlFor={category}>{category}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Price Range</h3>
                      <div className="px-2">
                        <Slider
                          value={priceRange}
                          onValueChange={handlePriceRangeChange}
                          onValueCommit={applyPriceRange}
                          min={0}
                          max={100000}
                          step={1000}
                          className="mb-4"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{formatPrice(priceRange[0])}</span>
                          <span>{formatPrice(priceRange[1])}</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Desktop Filters */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg p-6 sticky top-8">
              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => 
                            handleCategoryChange(category, checked as boolean)
                          }
                        />
                        <Label htmlFor={category}>{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Price Range */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Price Range</h3>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={handlePriceRangeChange}
                      onValueCommit={applyPriceRange}
                      min={0}
                      max={100000}
                      step={1000}
                      className="mb-4"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters to find what you're looking for
                </p>
                <Button 
                  onClick={clearFilters}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentProducts.map((product) => (
                  <Card 
                    key={product.id}
                    className="group bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                      <img
                        src={product.image || fallbackImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          if (!(e.target as HTMLImageElement).dataset.tried) {
                            (e.target as HTMLImageElement).dataset.tried = "1";
                            (e.target as HTMLImageElement).src = fallbackImage;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-12 w-12 rounded-full bg-white/90 hover:bg-white hover:scale-110 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.id}`);
                          }}
                        >
                          <Eye className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      <div className="flex flex-col gap-3">
                        <span className="text-lg font-bold text-purple-600">
                          {formatPrice(product.price)}
                        </span>
                        <Button
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 hover:shadow-lg"
                          onClick={(e) => handleAddToCart(product.id, e)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    className="rounded-full w-10 h-10"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;