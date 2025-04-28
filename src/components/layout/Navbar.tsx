import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  LogOut, 
  Search, 
  Heart,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext'; // Import useCart hook
import axios from 'axios';
import { debounce } from 'lodash'; // You may need to install this: npm install lodash

// Define product interface for search results
interface SearchProduct {
  id: number;
  name: string;
  price: number;
  image: string | null;
}

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart(); // Get cart count from CartContext
  const navigate = useNavigate();

  // Format price to display with currency symbol
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  // Create a debounced search function to avoid too many API calls
  const debouncedSearch = debounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`/api/v1/product/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  // Update the search results when the query changes
  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
    
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery]);

  // Handle input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSearchResults(!!query);
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
    }
  };

  // Handle clicking a search result
  const handleSearchResultClick = (productId: number) => {
    navigate(`/product/${productId}`);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-purple-600">ShopEase</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center">
            <Link to="/products" className="px-3 py-2 text-gray-700 hover:text-purple-600">Products</Link>
            <Link to="/categories" className="px-3 py-2 text-gray-700 hover:text-purple-600">Categories</Link>
            <Link to="/deals" className="px-3 py-2 text-gray-700 hover:text-purple-600">Deals</Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4 search-container relative">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isSearching ? (
                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </form>
            
            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 bg-white mt-1 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 text-purple-600 animate-spin mr-2" />
                    <span>Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer flex items-center border-b border-gray-100 last:border-0"
                        onClick={() => handleSearchResultClick(product.id)}
                      >
                        <div className="h-12 w-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden mr-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/100?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium line-clamp-1">{product.name}</div>
                          <div className="text-sm text-purple-600">{formatPrice(product.price)}</div>
                        </div>
                      </div>
                    ))}
                    <div className="p-2 bg-gray-50 border-t border-gray-200">
                      <Button 
                        variant="link" 
                        className="w-full text-purple-600 text-sm" 
                        onClick={() => navigate(`/search?q=${encodeURIComponent(searchQuery)}`)}
                      >
                        See all results
                      </Button>
                    </div>
                  </>
                ) : searchQuery ? (
                  <div className="p-4 text-center text-gray-500">
                    No products found matching "{searchQuery}"
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Right Side Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/wishlist" className="text-gray-700 hover:text-purple-600">
              <Heart className="h-6 w-6" />
            </Link>
            <Link to="/cart" className="text-gray-700 hover:text-purple-600 relative">
              <ShoppingCart className="h-6 w-6" />
              <span className={`absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${cartCount > 0 ? 'opacity-100' : 'opacity-0'}`}>
                {cartCount}
              </span>
            </Link>
            
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={toggleProfileDropdown}
                  className="flex items-center text-gray-700 hover:text-purple-600 focus:outline-none"
                >
                  <span className="mr-1 hidden sm:inline-block">
                    {user.name || user.username}
                  </span>
                  <User className="h-6 w-6" />
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                
                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/orders" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      My Orders
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link 
                        to="/admin" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                    >
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-2">
                <Button variant="outline" asChild>
                  <Link to="/auth?tab=login">Sign In</Link>
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                  <Link to="/auth?tab=register">Register</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="text-gray-700 hover:text-purple-600 relative mr-4">
              <ShoppingCart className="h-6 w-6" />
              <span className={`absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${cartCount > 0 ? 'opacity-100' : 'opacity-0'}`}>
                {cartCount}
              </span>
            </Link>
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="px-3 py-2 search-container relative">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isSearching ? (
                      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    ) : (
                      <Search className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </form>
              
              {/* Mobile Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute left-3 right-3 bg-white mt-1 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                  {isSearching ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-6 w-6 text-purple-600 animate-spin mr-2" />
                      <span>Searching...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer flex items-center border-b border-gray-100 last:border-0"
                          onClick={() => {
                            handleSearchResultClick(product.id);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <div className="h-12 w-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden mr-3">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/100?text=No+Image";
                                }}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <div className="font-medium line-clamp-1">{product.name}</div>
                            <div className="text-sm text-purple-600">{formatPrice(product.price)}</div>
                          </div>
                        </div>
                      ))}
                      <div className="p-2 bg-gray-50 border-t border-gray-200">
                        <Button 
                          variant="link" 
                          className="w-full text-purple-600 text-sm" 
                          onClick={() => {
                            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                            setMobileMenuOpen(false);
                          }}
                        >
                          See all results
                        </Button>
                      </div>
                    </>
                  ) : searchQuery ? (
                    <div className="p-4 text-center text-gray-500">
                      No products found matching "{searchQuery}"
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <Link 
              to="/products" 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              to="/categories" 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link 
              to="/deals" 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Deals
            </Link>
            <Link 
              to="/wishlist" 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Wishlist
            </Link>
            
            <hr className="my-2 border-gray-200" />
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile" 
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link 
                  to="/orders" 
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                {user.role === 'ADMIN' && (
                  <Link 
                    to="/admin" 
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2 px-3 py-2">
                <Button className="w-full" variant="outline" asChild>
                  <Link 
                    to="/auth?tab=login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </Button>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                  <Link 
                    to="/auth?tab=register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;