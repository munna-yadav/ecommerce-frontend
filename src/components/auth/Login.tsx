import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

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
      // Redirect after successful login
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
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

export default Login;
