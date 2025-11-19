// SendOTPForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SendOTPForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const location = useLocation();
  const isForgotPassword = location.state?.isForgotPassword || false;

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Additional validation checks
  const validateForm = () => {
    // Check if email is empty
    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }

    // Check if email format is valid
    if (!validateEmail(email.trim())) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Check email length
    if (email.trim().length > 254) {
      toast.error("Email address is too long");
      return false;
    }

    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
    const domain = email.trim().split('@')[1]?.toLowerCase();
    
    if (!commonDomains.includes(domain)) {
      toast.warning("Please verify your email domain is correct");
    }

    return true;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    // Validate form before sending request
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    
    try {
      await axios.post('https://api.skillnestco.xyz/api/send_otp/', { 
        email: email.trim().toLowerCase() 
      });
      
      toast.success("OTP sent successfully! Check your email.");
      
      navigate('/verify-otp', {
        state: { email: email.trim().toLowerCase(), isForgotPassword },
      });
      
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 404) {
        toast.error("Email not found in our system");
      } else if (error.response?.status === 429) {
        toast.error("Too many requests. Please try again later");
      } else if (error.response?.status >= 500) {
        toast.error("Server error. Please try again later");
      } else {
        toast.error("Failed to send OTP. Please try again");
      }
      
      console.error('Failed to send OTP', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with real-time validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear previous error state if user starts typing
    if (value.trim() && !validateEmail(value.trim())) {
      // Optional: Show real-time validation (uncomment if needed)
      // toast.error("Invalid email format", { duration: 1000 });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Card className="w-full max-w-sm shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            Email Verification
          </CardTitle>
        </CardHeader>
        <form className="space-y-4 w-full max-w-md mx-auto mt-10" onSubmit={handleSendOTP}>
          <CardContent className="flex flex-col items-center gap-4">
            <Input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={handleEmailChange}
              required
              disabled={isLoading}
              className={`${
                email && !validateEmail(email) 
                  ? 'border-red-500 focus:border-red-500' 
                  : ''
              }`}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !email.trim()}
              className="w-full"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default SendOTPForm;