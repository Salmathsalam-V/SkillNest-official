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
import { Heart, MessageCircle } from "lucide-react";

export default function CreatorProfile() {
  const { id } = useParams();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [openPost, setOpenPost] = useState(null);
  const [editData, setEditData] = useState({ username: '', category: '', description: '', fullname: '', profile: '', background: '' });
  const [commentText, setCommentText] = useState({});

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

  useEffect(() => {
  const fetchCreatorData = async () => {
    try {

      const res = await axios.get("http://localhost:8000/api/creator/posts/", { withCredentials: true });
      console.log("Posts fetched:",{id}, res.data);
      const resPosts = await axios.get(`http://localhost:8000/api/creator/creators/${id}/posts/`);
      console.log("Posts fetched:", resPosts.data);
      setPosts(resPosts.data);
      const resCourses = await axios.get(`http://localhost:8000/api/creator/creators/${id}/courses/`);
      setCourses(resCourses.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching creator posts/courses:", err);
    }
  };
  fetchCreatorData();
}, [id]);

const handleDeletePost = async (postId) => {
  if (!window.confirm("Are you sure you want to delete this post?")) return;

  try {
    await axios.delete(`http://localhost:8000/api/creator/creators/posts/${postId}/`, {
      withCredentials: true,
    });
    toast.success("Post deleted successfully");
    setPosts((prev) => prev.filter((p) => p.id !== postId)); // remove from state
  } catch (err) {
    console.error("Error deleting post:", err);
    toast.error("Failed to delete post");
  }
};

const handleUpdatePost = async (post) => {
  try {
    const res = await axios.patch(
      `http://localhost:8000/api/creator/creators/posts/${post.id}/`,
      { caption: post.caption, image: post.image },
      { withCredentials: true }
    );

    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, ...res.data } : p))
    );
    toast.success("Post updated successfully");
    setOpenPost(null);
  } catch (err) {
    console.error("Error updating post:", err);
    toast.error("Failed to update post");
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
                        <p className="text-gray-600 text-sm mb-1">id: {id}</p>
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
<Dialog open={!!(openPost?.editMode)} onOpenChange={() => setOpenPost(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Post</DialogTitle>
    </DialogHeader>
    {openPost && (
      <div className="flex flex-col gap-3">
        {/* Caption */}
        <Textarea
          placeholder="Update caption..."
          value={openPost.caption}
          onChange={(e) =>
            setOpenPost((prev) => ({ ...prev, caption: e.target.value }))
          }
        />

        {/* Image */}
        <Input
          type="text"
          placeholder="Image URL"
          value={openPost.image || ""}
          onChange={(e) =>
            setOpenPost((prev) => ({ ...prev, image: e.target.value }))
          }
        />

        <Button onClick={() => handleUpdatePost(openPost)}>Save</Button>
      </div>
    )}
  </DialogContent>
</Dialog>

        {/* Tabs Section */}
        <Tabs defaultValue="posts" className="mt-8">
          <TabsList className="mb-4 bg-muted p-1 rounded-md w-fit">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {posts.map((post) => (
                  <Card key={post.id} className="shadow-lg rounded-2xl overflow-hidden">
                    {/* Post Image */}
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post"
                        className="w-full h-48 object-cover"
                      />
                    )}

                    <div className="p-3 space-y-2">
                      {/* Like & Comment Buttons */}
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="p-0">
                            <Heart className="w-5 h-5 text-red-500" />
                          </Button>
                          <span className="text-sm">{post.like_count} likes</span>
  <Button
    variant="outline"
    size="sm"
    onClick={() => setOpenPost({ ...post, editMode: true })}
  >
    Edit
  </Button>
  <Button
    variant="destructive"
    size="sm"
    onClick={() => handleDeletePost(post.id)}
  >
    Delete
  </Button>

                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0"
                          onClick={() => setOpenPost(post)}
                        >
                          <MessageCircle className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* First Comment */}
                      <div>
                        {post.comments?.length > 0 ? (
                          <>
                            <p className="text-sm">
                              <span className="font-semibold">
                                {post.comments[0].user?.username}:
                              </span>{" "}
                              {post.comments[0].content}
                            </p>
                            {post.comments.length > 1 && (
                              <button
                                onClick={() => setOpenPost(post)}
                                className="text-xs text-gray-500 hover:underline"
                              >
                                View more comments
                              </button>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-gray-400">No comments yet.</p>
                        )}
                      </div>

                      {/* Course Rating (if applicable) */}
                      {post.is_course && (
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className="cursor-pointer text-yellow-400 text-lg"
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center mt-6">No posts available.</p>
            )}

            {/* Popup for comments (reuse same as PostsPage) */}
            <Dialog open={!!openPost} onOpenChange={() => setOpenPost(null)}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Comments</DialogTitle>
                </DialogHeader>
                {openPost && (
                  <div className="space-y-3">
                    {openPost.image && (
                      <img
                        src={openPost.image}
                        alt="Post"
                        className="rounded-lg w-full mb-2"
                      />
                    )}
                    <p className="text-gray-700">{openPost.caption}</p>

                    {/* All comments */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {openPost.comments?.length > 0 ? (
                        openPost.comments.map((comment) => (
                          <div key={comment.id} className="border-b pb-1">
                            <p className="text-sm font-semibold">
                              {comment.user?.username}
                            </p>
                            <p className="text-sm text-gray-600">{comment.content}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">No comments yet.</p>
                      )}
                    </div>

                    {/* Add Comment */}
                    <div className="flex items-center gap-2 mt-3">
                      <Textarea
                        placeholder="Write a comment..."
                        value={commentText[openPost.id] || ""}
                        onChange={(e) =>
                          setCommentText({
                            ...commentText,
                            [openPost.id]: e.target.value,
                          })
                        }
                        className="flex-1"
                      />
                      <Button onClick={() => handleCommentSubmit(openPost.id)}>
                        Post
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>


          {/* <TabsContent value="courses">
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {courses.map((course) => (
                  <Card key={course.id} className="p-4 shadow-md rounded-xl">
                    {course.post.image && (
                      <img
                        src={course.course.image}
                        alt="Course"
                        className="w-full h-48 object-cover rounded-md mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-lg mb-2">{course.post.caption}</h3>
                    <p className="text-sm text-gray-600">Rating: {course.rating || "No ratings yet"}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center mt-6">No courses yet.</p>
            )}
          </TabsContent> */}

          <TabsContent value="reviews">
            <p className="text-muted-foreground text-center mt-6">No reviews yet.</p>
          </TabsContent>
        </Tabs>
      </div>
    </CreatorLayout>
  );
}
