import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const CreateExtraDetails = () => {
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [background, setBackground] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const categories = ['Crochet', 'Baking', 'Crafting', 'Pottery', 'Painting', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedCategory = category === 'Other' ? customCategory : category;

    try {
      console.log("email",email)
      await axios.post('http://localhost:8000/api/create-creator/', {
        email,
        category: selectedCategory,
        description,
        background,
      }, { withCredentials: true });
      navigate('/login')
    } catch (error) {
      toast.error("Failed to create background")
      console.error('Failed to create creator background:', error);
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
      setBackground(res.data.secure_url);  // Set the uploaded image URL
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error("Image upload failed");
    }
  };


  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Become a Creator</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div>
              <Label>Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 mt-1 rounded-md border border-gray-300"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {category === 'Other' && (
                <Input
                  placeholder="Enter your category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2"
                  required
                />
              )}
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Tell us about your craft..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Background Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                required
              />
            </div>
          {background && (
            <img src={background} alt="Background preview" className="w-24 h-24 rounded-full mt-2" />
          )}

            

            <Button type="submit" className="w-full">Submit</Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default CreateExtraDetails;
