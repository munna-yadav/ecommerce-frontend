import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Upload, Lock, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { log } from 'console';

const EditProfile = () => {
  const { user: authUser, checkAuthStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const navigate = useNavigate();

  // User profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Selected image file
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/auth');
          return;
        }

        const response = await axios.get('/api/v1/user/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log(response.data);
        
        const userData = response.data;
        setProfile({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',

          address: {
            street: userData.address?.street || '',
            city: userData.address?.city || '',
            state: userData.address?.state || '',
            zipCode: userData.address?.zipCode || '',
            country: userData.address?.country || ''
          }
        });

        // If user has a profile image, set it as preview
        if (userData.image) {
          setPreviewImage(userData.image);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load profile data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;

    // Handle address fields
    if (id.includes('address-')) {
      const addressField = id.replace('address-', '');
      setProfile(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      // Handle regular fields
      setProfile(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [id.replace('password-', '')]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/v1/user/update-profile', {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      await checkAuthStatus(); // Refresh user data in auth context
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/v1/user/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Show more specific error messages based on backend response
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          toast.error('Current password is incorrect');
        } else {
          toast.error(error.response.data.message || 'Failed to change password');
        }
      } else {
        toast.error('Failed to change password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage) {
      toast.error('Please select an image to upload');
      return;
    }
    
    setIsImageUploading(true);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      await axios.put('/api/v1/user/change-image', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      await checkAuthStatus(); // Refresh user data in auth context
      toast.success('Profile picture updated successfully');
      setSelectedImage(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsImageUploading(false);
    }
  };

  if (isLoading && !profile.name) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => navigate('/profile')} className="mr-4">
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Profile
        </Button>
        <h1 className="text-3xl font-bold">Edit Profile</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto">
        {/* Profile Photo Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
            <CardDescription>Upload a profile picture to personalize your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-purple-100 flex-shrink-0">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Profile Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <User className="h-24 w-24 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-grow w-full">
                <Label htmlFor="profile-image" className="mb-3 block text-lg font-medium">Select a new photo</Label>
                <div className="space-y-4">
                  <Input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer bg-white"
                  />
                  <p className="text-sm text-gray-500">
                    Supported formats: JPEG, PNG, GIF. Max size: 2MB.
                  </p>
                  <Button 
                    onClick={handleUploadImage} 
                    className="bg-purple-600 hover:bg-purple-700 mt-2"
                    disabled={isImageUploading || !selectedImage}
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    {isImageUploading ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your basic personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="personal-form" onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={profile.name} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profile.email} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={profile.phone} 
                    onChange={handleInputChange}
                    placeholder="e.g. +1 (555) 123-4567"
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              form="personal-form"
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
            >
              <Save className="h-5 w-5 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>

        {/* Address Details */}
        <Card>
          <CardHeader>
            <CardTitle>Address Details</CardTitle>
            <CardDescription>
              Update your shipping and billing address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="address-form" onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <Label htmlFor="address-street">Street Address</Label>
                <Textarea 
                  id="address-street" 
                  value={profile.address.street} 
                  onChange={handleInputChange}
                  className="resize-none"
                  placeholder="e.g. 123 Main Street, Apt 4B"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address-city">City</Label>
                  <Input 
                    id="address-city" 
                    value={profile.address.city} 
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="address-state">State/Province</Label>
                  <Input 
                    id="address-state" 
                    value={profile.address.state} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address-zipCode">ZIP/Postal Code</Label>
                  <Input 
                    id="address-zipCode" 
                    value={profile.address.zipCode} 
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="address-country">Country</Label>
                  <Input 
                    id="address-country" 
                    value={profile.address.country} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              form="address-form"
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
            >
              <Save className="h-5 w-5 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="password-form" onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <Label htmlFor="password-oldPassword">Current Password</Label>
                <Input 
                  id="password-oldPassword" 
                  type="password" 
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password-newPassword">New Password</Label>
                <Input 
                  id="password-newPassword" 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              <div>
                <Label htmlFor="password-confirmPassword">Confirm New Password</Label>
                <Input 
                  id="password-confirmPassword" 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              form="password-form"
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
            >
              <Lock className="h-5 w-5 mr-2" />
              {isLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;