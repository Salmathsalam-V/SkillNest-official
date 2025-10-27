import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login,googleLogin } from '@/endpoints/axios';
import { setUser } from '../Redux/userSlice';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Loader }  from '@/components/Layouts/Loader';

const schema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email must include a valid domain (like .com, .in, .org)")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onBlur", 
  });

const onSubmit = async (data) => {
  try {
    const res = await login(data.email, data.password);
    console.log('Login response:', res);

    if (res.success) {
      dispatch(setUser(res.data.user));
      const userType = res.data.user.user_type;
      toast.success(res.data.message || 'Login successful!');

      if (userType === 'learner') navigate('/learnerhome');
      else if (userType === 'creator') navigate('/creatorhome');
      else navigate('/adminhome');
    } else {
      // 🧠 Handle different error formats gracefully
      const errData = res.error;
      let errorMessage = 'Invalid credentials';

      if (typeof errData === 'string') errorMessage = errData;
      else if (errData?.detail) errorMessage = errData.detail;
      else if (errData?.non_field_errors) errorMessage = errData.non_field_errors.join(', ');
      else if (errData?.error) errorMessage = errData.error;

      toast.error(errorMessage);
      console.error('Backend error:', errData);
    }
  } catch (error) {
    console.error('Login error (network or unexpected):', error);
    const backendError = error.response?.data?.error;
    toast.error(backendError || error.message || 'Something went wrong during login.');
  }
};

const handleGoogleLogin = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;

      const response = await axios.post(
        "http://127.0.0.1:8000/api/google-login/",
        { token },
        { withCredentials: true }  // ✅ so cookies (access & refresh tokens) are saved
      );

      console.log("Google login response:", response.data, response.data.user, response.data.redirect_url);
      if (response.data.user) {
        dispatch(setUser(response.data.user));
        toast.success(response.data.message || "Login successful!");
      }

      // ✅ check for redirect_url
      if (response.data.redirect_url) {
        // use navigate() if using react-router
        navigate(response.data.redirect_url);

        // or this if outside of a Router component:
        // window.location.href = response.data.redirect_url;
      } else {
        console.warn("No redirect_url found in response");
      }

    } catch (error) {
      console.error("Google login failed:", error.response?.data || error.message);
    }
  };
  if (loading) return <Loader text="Loading..." />; // or redirect to login

  return (
    <div className="flex flex-col gap-6 min-h-screen justify-center items-center bg-muted px-4">
      <Card className="overflow-hidden p-0 w-full max-w-3xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-sm">
                  Login to your SkillNest account
                </p>
              </div>

              {/* Email Field */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
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
                  {...register("password")}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" variant='custom'>
                Login
              </Button>

              {/* Divider */}
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>

              {/* Google Login */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => console.error('Google Login Failed')}
                />

                {/* <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    const token = credentialResponse.credential;
                    try {
                      const token = credentialResponse.credential;
                      const res = axios.post('http://localhost:8000/api/google-login/', { token }, { withCredentials: true });
                      console.log('Google login response:', res);
                      if (res.success) {
                        dispatch(setUser(res.data));
                        console.log('User data from Google login:', res.data);
                        if (response.data.redirect_url) {
                          console.log('Redirecting to:', response.data.redirect_url);
                          window.location.href = response.data.redirect_url;
                        }
                      }
                      // dispatch(setUser(res.data));
                      // const redirectUrl = res.data.redirect_url;
                      // if (redirectUrl) window.location.href = redirectUrl;
                    } catch (err) {
                      console.error('Backend error', err);
                    }
                  }}
                  onError={() => console.log('Google login failed')}
                /> */}
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