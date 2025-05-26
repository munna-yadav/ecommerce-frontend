import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Heart, ShoppingCart } from 'lucide-react';

interface LoginProps {
  returnUrl?: string;
}

const Login: React.FC<LoginProps> = ({ returnUrl = '/' }) => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.emailOrUsername || !formData.password) {
      return;
    }
    
    const success = await login(formData.emailOrUsername, formData.password);
    if (success) {
      // Redirect after successful login to the returnUrl
      setTimeout(() => {
        navigate(returnUrl);
      }, 500);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search submission
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="emailOrUsername">Email or Username</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input 
            id="emailOrUsername" 
            type="text" 
            placeholder="Enter your email or Username" 
            className="pl-10"
            value={formData.emailOrUsername}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-500">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input 
            id="password" 
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password" 
            className="pl-10"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {showPassword ? (
            <Eye 
              className='absolute right-3 top-3 h-5 w-5 text-gray-400 cursor-pointer' 
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <EyeOff 
              className='absolute right-3 top-3 h-5 w-5 text-gray-400 cursor-pointer' 
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>
      </div>
      <Button 
        className="w-full bg-purple-600 hover:bg-purple-700"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : (
          <>
            <LogIn className="mr-2 h-5 w-5" /> Sign In
          </>
        )}
      </Button>
    </form>
  );
};

// New Product Card Component
const ProductCard = ({ product }) => {
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Image Container with Hover Effect */}
      <div className="aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
          <button className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors duration-300">
            <Heart className="h-5 w-5 text-gray-700" />
          </button>
          <button className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors duration-300">
            <ShoppingCart className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{product.category}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-semibold text-purple-600">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-gray-500 line-through">
            {formatPrice(product.originalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
