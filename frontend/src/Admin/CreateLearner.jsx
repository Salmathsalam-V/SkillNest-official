import Layout from '@/components/Layouts/AdminLayout'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { registerUser,imageUpload } from '@/endpoints/axios';

export const CreateLearner = () => {
    const navigate=useNavigate()
    const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullname: "",
    user_type: "learner", // default selected
    profile: "",
    });
    const [profile,setProfile] = useState()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        formData['profile'] = profile
        const res = await registerUser (formData);
        toast.success("Registered successfully");
        navigate('/listlearner')
        } catch (err) {
        console.error("Registration error:", err);
        
        toast.error("Registered Failed");
        }
    };
      const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'skillnest_profile'); 
    
        try {
          const res = await imageUpload(
                formData,
              );
          setProfile(res.data.url);  
        } catch (err) {
          console.error("Image upload failed:", err);
          toast.error("Image upload failed");
        }
      };
    

  return (
    <>
    <Layout>

         <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto mt-10">
              <Input name="username" placeholder="Username" onChange={handleChange} />
              <Input name="email" type="email" placeholder="Email" onChange={handleChange} />
              <Input name="password" type="password" placeholder="Password" onChange={handleChange} />
              <Input name="fullname" placeholder="Full Name" onChange={handleChange} />
              <Input type="hidden" name="user_type" value="learner" />
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {profile && (
                <img
                  src={profile}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full mt-2"
                />
              )}

              <Button type="submit">Create</Button>
            </form>
    </Layout>
    </>
  )
}
