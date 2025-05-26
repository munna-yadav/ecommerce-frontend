import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id.replace('register-', '')]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      toast.error("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    // Simplified user data object - avoiding nested properties that might cause Jackson issues
    const userData = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: "CUSTOMER"  // Default role as a simple string
    };

    console.log("Registering with data:", userData);

    const success = await register(userData);
    if (success) {
      // Reset form
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      
      // Redirect to login page
      setTimeout(() => {
        navigate('/auth?tab=login');
      }, 1500);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className='space-y-2'>
        <Label htmlFor='register-name'>Full Name</Label>
        <div className='relative'>
          <User className='absolute left-3 top-3 h-5 w-5 text-gray-400' />
          <Input 
            id='register-name' 
            type='text' 
            placeholder='Enter your full name' 
            className='pl-10'
            value={formData.name}
            required
            onChange={handleChange} 
          />
        </div>
      </div>
      <div className='space-y-2'>
        <Label htmlFor='register-username'>Username</Label>
        <div className='relative'>
          <User className='absolute left-3 top-3 h-5 w-5 text-gray-400' />
          <Input 
            id='register-username' 
            type='text' 
            placeholder='username' 
            className='pl-10'
            required
            value={formData.username}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input 
            id="register-email" 
            type="email" 
            required
            placeholder="Enter your email" 
            className="pl-10"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input 
            id="register-password" 
            type={showPassword ? "text" : "password"}
            required
            placeholder="Create a password" 
            className="pl-10"
            value={formData.password}
            onChange={handleChange}
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
      <div className="space-y-2">
        <Label htmlFor="register-confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input 
            id="register-confirmPassword" 
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password" 
            className="pl-10"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {showConfirmPassword ? (
            <Eye 
              className='absolute right-3 top-3 h-5 w-5 text-gray-400 cursor-pointer' 
              onClick={() => setShowConfirmPassword(false)}
            />
          ) : (
            <EyeOff 
              className='absolute right-3 top-3 h-5 w-5 text-gray-400 cursor-pointer' 
              onClick={() => setShowConfirmPassword(true)}
            />
          )}
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-purple-600 hover:bg-purple-700"
        disabled={isLoading}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};

export default Register;
