import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Login from "@/components/auth/Login";
import Register from "@/components/auth/Register";
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Parse tab from URL query string
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const defaultTab = tabParam === 'register' ? 'register' : 'login';
  
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL to reflect current tab without page reload
    navigate(`/auth?tab=${value}`, { replace: true });
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto bg-purple-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to ShopEase</h1>
          <p className="text-gray-500 mt-2">Sign in to your account or create a new one</p>
        </div>

        <Card>
          <CardHeader className="p-0">
            <Tabs
              defaultValue={activeTab}
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="p-6">
                <CardTitle className="mb-1">Sign In</CardTitle>
                <CardDescription className="mb-4">
                  Enter your credentials to access your account
                </CardDescription>
                <Login />
              </TabsContent>
              
              <TabsContent value="register" className="p-6">
                <CardTitle className="mb-1">Create Account</CardTitle>
                <CardDescription className="mb-4">
                  Fill in your details to create a new account
                </CardDescription>
                <Register />
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-purple-600 hover:text-purple-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-purple-600 hover:text-purple-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
