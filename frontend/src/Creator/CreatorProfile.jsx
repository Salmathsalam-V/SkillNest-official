import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CreatorLayout from '@/components/Layouts/CreatorLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,DialogDescription } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function CreatorProfile() {
  const { id } = useParams();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [editData, setEditData] = useState({ username: '', category: '', description: '', fullname: '', profile: '', background: '' });

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/admin/creators-view/${id}/`);
        if (response.data.success) {
          setCreator(response.data.creator);
          setEditData({
            username: response.data.creator.username,
            category: response.data.creator.category,
            description: response.data.creator.description,
            fullname: response.data.creator.fullname,
            profile: response.data.creator.profile
          });
        } else {
          setError("Creator not found");
        }
      } catch (err) {
        console.error("Fetch failed:", err);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    fetchCreator();
  }, [id]);

  const handleInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.patch(`http://localhost:8000/api/admin/creators-view/${id}/`, editData);
      toast.success("Profile updated successfully");
      setIsEditOpen(false);
      if (response.data.success) {
        setCreator({ ...creator, ...editData });
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };
const handleBackgroundUpload = async (e) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'skillnest_profile'); // Your Cloudinary preset

  try {
    setUploading(true);
    const res = await axios.post(
      'https://api.cloudinary.com/v1_1/dg8kseeqo/image/upload',
      formData
    );
    setEditData(prev => ({ ...prev, background: res.data.secure_url }));
    toast.success("Background image uploaded");
  } catch (error) {
    toast.error("Image upload failed");
    console.error("Cloudinary upload error:", error);
  } finally {
    setUploading(false);
  }
};

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;

  return (
    <CreatorLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Banner */}
        <div
          className="relative p-6 rounded-xl shadow-md text-center text-white overflow-hidden"
          style={{
            backgroundImage: `url(${creator.background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-blue-100 opacity-80 z-0"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-sky-700">SkillNest</h1>
            <p className="text-md text-gray-700 mt-2">
              {creator.category} Creator - {creator.username}
            </p>
          </div>
        </div>

        {/* Creator Card */}
        <Card className="mt-6 p-6 flex gap-6 items-center">
          <img
            src={creator.profile}
            alt="creator"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
          />
          <div className="flex-1">
            <h2 className="text-xl font-semibold">@{creator.username}</h2>
            <p className="text-gray-600 text-sm mb-1">Email: {creator.email}</p>
            <p className="text-gray-600 text-sm mb-1">Fullname: {creator.fullname}</p>
            <div className="flex flex-col gap-2">
          <div className="mt-2">
            <p className="text-gray-600 text-sm mb-1">Background Image:</p>
            <img
              src={creator.background}
              alt="Background"
              className="w-full max-w-md h-40 object-cover rounded-md border"
            />
          </div>
          </div>

            <p className="text-gray-600 text-sm mb-1">Category: {creator.category}</p>
            <p className="text-gray-700">{creator.description}</p>

            {/* Edit Button */}
            <div className="mt-4">
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => setIsEditOpen(true)}>Edit Profile</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                  <DialogTitle>Edit Creator Info</DialogTitle>
                  <DialogDescription>Update the creator's information below and click Save.</DialogDescription>
                </DialogHeader>

                  <div className="flex flex-col gap-4">
                    <Input
                      name="username"
                      placeholder="Username"
                      value={editData.username}
                      onChange={handleInputChange}
                    />
                    <Input
                      name="fullname"
                      placeholder="Fullname"
                      value={editData.fullname}
                      onChange={handleInputChange}
                    />
                    <Input
                      name="category"
                      placeholder="Category"
                      value={editData.category}
                      onChange={handleInputChange}
                    />
                    <div className="flex flex-col gap-2">
  <Label htmlFor="background-upload">Upload Background</Label>
  <Input
    id="background-upload"
    type="file"
    accept="image/*"
    onChange={handleBackgroundUpload}
  />
  {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
  {editData.background && (
    <img
      src={editData.background}
      alt="Background preview"
      className="w-full max-w-sm h-40 object-cover rounded-md mt-2 border"
    />
  )}
</div>

<div className="mt-2">
  <Label>Or paste background image URL</Label>
  <Input
    name="background"
    placeholder="Background URL"
    value={editData.background}
    onChange={handleInputChange}
  />
</div>

                    <Textarea
                      name="description"
                      placeholder="Description"
                      value={editData.description}
                      onChange={handleInputChange}
                    />
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="posts" className="mt-8">
          <TabsList className="mb-4 bg-muted p-1 rounded-md w-fit">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <p className="text-muted-foreground text-center mt-6">No posts available.</p>
          </TabsContent>
          <TabsContent value="courses">
            <p className="text-muted-foreground text-center mt-6">No courses yet.</p>
          </TabsContent>
          <TabsContent value="reviews">
            <p className="text-muted-foreground text-center mt-6">No reviews yet.</p>
          </TabsContent>
        </Tabs>
      </div>
    </CreatorLayout>
  );
}
