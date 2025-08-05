import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, get_user } from '@/endpoints/axios';
import { setUser } from '../Redux/userSlice';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      if (res?.success) {
        dispatch(setUser(res.data.user));
        const userType = res.data.user.user_type;
        toast.success('Login successful!');
        console.log("user_",userType)
        if (userType === 'learner') navigate('/learnerhome');
        else if (userType === 'creator') navigate('/creatorhome');
        else navigate('/adminhome');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error("login failed");
      toast.error("Login failed: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="flex flex-col gap-6 min-h-screen justify-center items-center bg-muted px-4">
      <Card className="overflow-hidden p-0 w-full max-w-3xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-sm">
                  Login to your SkillNest account
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/send-otp"
                    state={{ isForgotPassword: true }}
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                    >
                      Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" variant='custom'>
                Login
              </Button>

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    const token = credentialResponse.credential;
                    console.log("Google JWT token:", token);
                    console.log("Token length:", token.length);

                    try {
                      const res = await axios.post('http://localhost:8000/api/google-login/',
                        { token },
                        { withCredentials: true }
                      );
                      dispatch(setUser(res.data));
                      const redirectUrl = res.data.redirect_url;
                      if (redirectUrl) window.location.href = redirectUrl;
                    } catch (err) {
                      console.error('Backend error', err);
                    }
                  }}
                  onError={() => console.log('Google login failed')}
                />
              </div>

              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/register" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>

          {/* Right Side Image */}
          <div className="bg-muted relative hidden md:block">
            <img
              src="./login_image2.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
};

export default Login;
