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
  const navigate = useNavigate()
  
  const location = useLocation();
  const isForgotPassword = location.state?.isForgotPassword || false;

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/send_otp/', { email });
      navigate('/verify-otp', {
        state: { email, isForgotPassword }, // Pass it forward
      });
    } catch (error) {
      toast.error("Failed to send OTP");
      console.error('Failed to send OTP', error);
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
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit">Send OTP</Button>
          </CardContent>
        </form>

      </Card>
    </div>
  );
};

export default SendOTPForm;
