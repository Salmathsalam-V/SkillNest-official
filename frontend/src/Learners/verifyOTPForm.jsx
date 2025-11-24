import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const VerifyOTPForm = () => {
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(null);
  const [resendStatus, setResendStatus] = useState('');
  const [cooldown, setCooldown] = useState(60); // ⏳ 60 seconds timer
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  // 🔁 Countdown effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://api.skillnestco.xyz/api/verify_otp/', {
        email,
        otp,
      });
      if (response.data.verified) {
        setVerified(true);
        toast.success("OTP verified");
        const user_type = response.data.user_type;
        setTimeout(() => {
          if (location.state?.isForgotPassword) {
            navigate('/reset-password', { state: { email } });
          } else {
            if (user_type === 'creator') {
              navigate('/ceate-extradata', { state: { email } });
            } else {
              navigate('/login');
            }
          }
        }, 1000);
      }
    } catch (error) {
      setVerified(false);
      toast.error("OTP verification failed");
    }
  };

  const handleResend = async () => {
    try {
      await axios.post('http://localhost:8000/api/send_otp/', { email });
      setResendStatus('OTP resent successfully ✅');
      toast.success("OTP resent successfully");

      // 🔁 Restart cooldown
      setCooldown(60);

      setTimeout(() => setResendStatus(''), 3000);
    } catch (err) {
      setResendStatus('Failed to resend OTP ❌');
      toast.error("Failed to resend OTP ");
      setTimeout(() => setResendStatus(''), 3000);
    }
  };

  if (!email) {
    return (
      <p className="text-center text-red-500 mt-10">
        Email not provided. Please go back and enter your email.
      </p>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            Enter the OTP sent to your email
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleVerify}>
          <CardContent className="flex flex-col items-center gap-4">
            
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <Button type="submit" className="w-full">Verify OTP</Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              className="w-full"
              disabled={cooldown > 0} 
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </Button>

            {verified === true && <p className="text-green-600 text-center">Email verified successfully ✅</p>}
            {verified === false && <p className="text-red-600 text-center">OTP is incorrect ❌</p>}
            {resendStatus && <p className="text-sm text-blue-600 text-center">{resendStatus}</p>}
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default VerifyOTPForm;
