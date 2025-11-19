import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { imageUpload, registerUser } from "@/endpoints/axios";

// ✅ validation schema
const schema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required")
    .matches(
      /^[A-Za-z0-9_.]+$/,
      "Username can only contain letters, digits, underscores (_), and dots (.), with no spaces"
    ),
  fullname: Yup.string().required("Full name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Email must include a valid domain (like .com, .in)"
    )
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  user_type: Yup.string()
    .oneOf(["learner", "creator"], "Select a valid account type")
    .required("Account type is required"),
});


export const Register = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState("");

  // ✅ include setError from useForm
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  // ✅ handle backend errors
const handleBackendErrors = (errorData) => {

  if (typeof errorData === "object" && errorData !== null) {
    Object.entries(errorData).forEach(([field, messages]) => {
      const message = Array.isArray(messages) ? messages[0] : messages;

      // Map to form errors
      setError(field, {
        type: "server",
        message,
      });

      // Toast messages for user clarity
      if (field === "username" && message.includes("exists")) {
        toast.error("Username already taken. Please choose a different one.");
      } else if (field === "email" && message.includes("exists")) {
        toast.error("Email already registered. Please use a different email or try logging in.");
      } else {
        toast.error(`${field}: ${message}`);
      }
    });
  } else {
    toast.error("Registration failed. Please check your inputs.");
  }
};


  // ✅ image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "skillnest_profile");

    try {
      const res = await imageUpload(
        formData
      );
      setProfile(res.data.url);
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error("Image upload failed");
      console.error("Image upload failed:", err);
    }
  };

const onSubmit = async (data) => {
  const finalData = { ...data, profile };
  const res = await registerUser(finalData);

  if (res.success) {
    // Registration succeeded ✅
    await axios.post("https://api.skillnestco.xyz/api/send_otp/", { email: data.email });
    toast.success("OTP sent to your email successfully");
    navigate("/verify-otp", {
      state: { email: data.email, isForgotPassword: false },
    });
  } else {
    // Registration failed ❌
    const backendError = res.error?.response?.data;
    if (backendError) {
      handleBackendErrors(backendError);  // ✅ use your function
    } else {
      toast.error("Registration failed. Please try again.");
    }
  }
};



  return (
    <div className="flex flex-col gap-6 min-h-screen justify-center items-center bg-muted px-4">
      <Card className="overflow-hidden p-0 w-full max-w-3xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-sm">
                  Sign up to SkillNest and start your journey
                </p>
              </div>

              {/* Username */}
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="yourusername"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm">{errors.username.message}</p>
                )}
              </div>

              {/* Full Name */}
              <div className="grid gap-3">
                <Label htmlFor="fullname">Full Name</Label>
                <Input id="fullname" placeholder="John Doe" {...register("fullname")} />
                {errors.fullname && (
                  <p className="text-red-500 text-sm">{errors.fullname.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>

              {/* User Type */}
              <div className="grid gap-3">
                <Label htmlFor="user_type">Account Type</Label>
                <select
                  id="user_type"
                  {...register("user_type")}
                  className="border border-input rounded-md px-3 py-2 text-sm"
                >
                  <option value="learner">Learner</option>
                  <option value="creator">Creator</option>
                </select>
                {errors.user_type && (
                  <p className="text-red-500 text-sm">{errors.user_type.message}</p>
                )}
              </div>

              {/* Profile Image */}
              <div>
                <Label>Profile Image</Label>
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
              </div>
              {profile && (
                <img
                  src={profile}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full mt-2"
                />
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                variant="custom"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing up..." : "Sign Up"}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Login
                </a>
              </div>
            </div>
          </form>

          {/* Right Side Image */}
          <div className="bg-muted relative hidden md:block">
            <img
              src="./login_image1.png"
              alt="Register"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs *:[a]:underline *:[a]:underline-offset-4">
        By signing up, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
};
