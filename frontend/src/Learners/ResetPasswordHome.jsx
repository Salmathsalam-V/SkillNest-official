import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const ResetPasswordForm = () => {
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/reset_password/', {
        email,
        new_password: password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error("Failed to reset password");
      console.error('Failed to reset password', err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Card className="w-full max-w-sm shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            Reset Your Password
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleReset}>
          <CardContent className="flex flex-col items-center gap-4">
            <Input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">Reset Password</Button>
            {success && <p className="text-green-600">Password reset successfully ✅</p>}
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default ResetPasswordForm;
