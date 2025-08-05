import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

export const  Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullname: "",
    user_type: "learner",
  });

  const navigate = useNavigate();
  const [profile, setProfile] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/register/", formData);
      toast.success("Registred successfully");
      navigate("/send-otp");
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Registration failed!")
    }
  };

   const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'skillnest_profile'); // from Cloudinary dashboard

    try {
      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dg8kseeqo/image/upload',
        formData
      );
      setProfile(res.data.secure_url);  // Set the uploaded image URL
    } catch (err) {
      toast.error("Image upload failed");
      console.error("Image upload failed:", err);
    }
  };
  return (
    <div className="flex flex-col gap-6 min-h-screen justify-center items-center bg-muted px-4">
      <Card className="overflow-hidden p-0 w-full max-w-3xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-sm">
                  Sign up to SkillNest and start your journey
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="yourusername"
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="fullname">Full Name</Label>
                <Input
                  id="fullname"
                  name="fullname"
                  placeholder="John Doe"
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="user_type">Account Type</Label>
                <select
                  id="user_type"
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  className="border border-input rounded-md px-3 py-2 text-sm"
                >
                  <option value="learner">Learner</option>
                  <option value="creator">Creator</option>
                </select>
              </div>
<div>
              <Label>Profile Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                required
              />
            </div>
          {profile && (
            <img src={profile} alt="Profile preview" className="w-24 h-24 rounded-full mt-2" />
          )}

            <div>
              <Label>Profile URL</Label>
              <Input
                type="url"
                placeholder="Link to your profile picture or page"
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
              />
            </div>
              <Button type="submit" className="w-full" variant="custom">
                Sign Up
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

