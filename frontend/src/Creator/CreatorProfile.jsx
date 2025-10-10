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
import { createComment, imageUpload, updateCreatorProfile, updatePost } from '../endpoints/axios';

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
  const [openEditPost, setOpenEditPost] = useState(null);
  const [openCommentsPost, setOpenCommentsPost] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPost, setNewPost] = useState({ caption: "", image: "" });
  const [image, setImage] = useState('');
  const [nextPage, setNextPage] = useState(0); // offset tracker
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 6;

  // merging create and edit post modal
  const [postModal, setPostModal] = useState({
      open: false,
      mode: 'create', // 'create' | 'edit'
      data: { id: null, caption: '', image: '' },
    });
    const openCreateModal = () =>
  setPostModal({ open: true, mode: 'create', data: { id: null, caption: '', image: '' } });

const openEditModal = (post) =>
  setPostModal({
    open: true,
    mode: 'edit',
    data: { id: post.id, caption: post.caption || '', image: post.image || '' },
  });

const closePostModal = () =>
  setPostModal((prev) => ({ ...prev, open: false }));

const handlePostImageUpload = async (e) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append('file', file);

  try {
    console.log("Uploading image:", file);
    const res = await imageUpload(
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      }
    );
    console.log("Upload response:", res);
    const url = res.data.url;
    setPostModal((prev) => ({
      ...prev,
      data: { ...prev.data, image: url },
    }));

    toast.success("Image uploaded");
  } catch (err) {
    console.error("Image upload failed:", err);
    toast.error("Image upload failed");
  }
};

const submitPost = async () => {
  const { mode, data } = postModal;
  const payload = { caption: data.caption, image: data.image };

  if (!payload.caption?.trim()) {
    toast.error("Caption is required");
    return;
  }

  try {
    let res;
    if (mode === 'create') {
      res = await getCreatorPosts(id);
      setPosts((prev) => [res.data, ...prev]);
      toast.success("Post created successfully");
    } else {
      // mode === 'edit'
      const res = await updatePost(data.id, payload);
      setPosts((prev) =>
        prev.map((p) => (p.id === data.id ? { ...p, ...res.data } : p))
      );
      toast.success("Post updated successfully");
    }
    closePostModal();
  } catch (err) {
    console.error("Error submitting post:", err);
    toast.error(`Failed to ${postModal.mode === 'create' ? 'create' : 'update'} post`);
  }
};

//end for merging create and edit post modal

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
      const res = await updateCreatorProfile(id, editData);
      toast.success("Profile updated successfully");
      setIsEditOpen(false);
      if (res.data.success) {
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
    formData.append('upload_preset', 'skillnest_profile'); 

    try {
      setUploading(true);
      const res = await axios.post(
        'http://localhost:8000/api/upload-image/',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );
      console.log("Upload response:", res.data.url);
      const url = res.data.url;
      setEditData(prev => ({ ...prev, background: url }));
      toast.success("Background image uploaded");
    } catch (error) {
      toast.error("Image upload failed");
      console.error("Cloudinary upload error:", error);
    } finally {
      setUploading(false);
    }
  };
const fetchPosts = async (offset = 0) => {
  try {
    const res = await axios.get(
      `http://localhost:8000/api/creator/creators/${id}/posts/?limit=${pageSize}&offset=${offset}`,
      { withCredentials: true }
    );
    setPosts(offset === 0 ? res.data.results : (prev) => [...prev, ...res.data.results]);
    setNextPage(offset + pageSize);
    setHasMore(!!res.data.next); // DRF gives `next` link if more pages exist
    const resCourses = await axios.get(`http://localhost:8000/api/creator/creators/${id}/courses/`);
    setCourses(resCourses.data.results || []);
    setLoading(false);
  } catch (err) {
    console.error("Error fetching posts:", err);
  }
};
useEffect(() => {
  setPosts([]);      
  setNextPage(0);
  setHasMore(true);
  fetchPosts(0);
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

   const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'skillnest_profile');

    try {
      const res = await axios.post(
        'http://localhost:8000/api/upload-image/',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );
      setImage(res.data.secure_url);
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error("Image upload failed");
    }
  };
const handleCreatePost = async () => {
  try {
    const res = await axios.post(
      `http://localhost:8000/api/creator/creators/${id}/posts/`,
      {
        ...newPost,
        image,  
      },
      { withCredentials: true }
    );

    setPosts((prev) => [res.data, ...prev]); // add new post on top
    toast.success("Post created successfully");
    setIsCreateOpen(false);
    setNewPost({ caption: "", image: "" });
  } catch (err) {
    console.error("Error creating post:", err);
    toast.error("Failed to create post");
  }
};

const handleCommentSubmit = async (postId) => {
  console.log("Submitting comment for post id:", postId);
  const text = commentText[postId];
  if (!text?.trim()) {
    toast.error("Comment cannot be empty");
    return;
  }

  const res = await createComment(postId, text);
  if (res.success) {
    // update UI immediately
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: [res.data, ...p.comments] } // prepend new comment
          : p
      )
    );
    toast.success("Comment posted");
    // clear text input
    setCommentText((prev) => ({ ...prev, [postId]: "" }));
  } else {
    toast.error("Failed to post comment");
  }
};
const handleProfileUpload = async (e) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'skillnest_profile'); // optional if needed by your backend

  try {
    setUploading(true);
    const res = await axios.post(
      'http://localhost:8000/api/upload-image/',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      }
    );
    console.log("Profile upload response:", res.data.url);
    const url = res.data.url;
    setEditData((prev) => ({ ...prev, profile: url }));
    toast.success("Profile image uploaded");
  } catch (error) {
    toast.error("Profile image upload failed");
    console.error("Upload error:", error);
  } finally {
    setUploading(false);
  }
};

  if (loading) return <p className="text-center py-10">Loaders</p>;
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
                  <DialogContent className="max-h-[80vh] overflow-y-auto">

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
                  {/* Upload Profile Image */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="profile-upload">Upload Profile Image</Label>
                    <Input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileUpload}
                    />
                    {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                    {editData.profile && (
                      <img
                        src={editData.profile}
                        alt="Profile preview"
                        className="w-24 h-24 rounded-full object-cover border mt-2"
                      />
                    )}
                  </div>

                  {/* Upload Background Image */}
                  <div className="flex flex-col gap-2 mt-3">
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


{/* <div className="mt-2">
  <Label>Or paste background image URL</Label>
  <Input
    name="background"
    placeholder="Background URL"
    value={editData.background}
    onChange={handleInputChange}
  />
</div> */}

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
<Dialog open={!!openEditPost} onOpenChange={() => setOpenEditPost(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Post</DialogTitle>
    </DialogHeader>
    {openEditPost && (
      <div className="flex flex-col gap-3">
        {/* Caption */}
        <Textarea
          placeholder="Update caption..."
          value={openEditPost.caption}
          onChange={(e) =>
            setOpenEditPost((prev) => ({ ...prev, caption: e.target.value }))
          }
        />

        {/* Image */}
        <Input
          type="text"
          placeholder="Image URL"
          value={openEditPost.image || ""}
          onChange={(e) =>
            setOpenEditPost((prev) => ({ ...prev, image: e.target.value }))
          }
        />

        <Button onClick={() => handleUpdatePost(openEditPost)}>Save</Button>
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
                    <strong   className="p-3 text-lg font-semibold"> {post.caption}</strong>  

                    <div className="p-3 space-y-2">
                      {/* Like & Comment Buttons */}
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="p-0" onClick={() => handleLikeToggle(post.id)}>
                            {post.is_liked ? (
                            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                            ) : (
                              <Heart className="w-5 h-5 text-gray-500" />
                            )}
                          </Button>
                          <span className="text-sm">{post.like_count} likes</span>
  <Button
  variant="outline"
  size="sm"
  onClick={() => openEditModal(post)}
>
  Edit
</Button>

  <Button
    variant="outline"
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
                {hasMore && (
                  <div className="flex justify-center mt-6">
                    <Button onClick={() => fetchPosts(nextPage)}>
                      Load More
                    </Button>
                  </div>
                )}


              </div>
            ) : (
              <p className="text-muted-foreground text-center mt-6">No posts available.</p>
            )}
                         {/* PLUS BUTTON CENTERED */}
<div className="flex justify-center mt-8">
  <Button
    size="lg"
    className="rounded-full w-12 h-12 flex items-center justify-center text-3xl"
    // onClick={() => setIsCreateOpen(true)}
    onClick={openCreateModal}
  >
    +
  </Button>
</div>

{/* merging create and edit post modal */}

<Dialog open={postModal.open} onOpenChange={(v) => (v ? null : closePostModal())}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>
        {postModal.mode === 'create' ? 'Create New Post' : 'Edit Post'}
      </DialogTitle>
    </DialogHeader>

    <div className="flex flex-col gap-4">
      {/* Caption */}
      <Textarea
        placeholder="Write a caption..."
        value={postModal.data.caption}
        onChange={(e) =>
          setPostModal((prev) => ({
            ...prev,
            data: { ...prev.data, caption: e.target.value },
          }))
        }
      />

      {/* Image upload */}
      <div className="space-y-2">
        <Label>Image</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={handlePostImageUpload}
        />
        <div className="text-sm text-muted-foreground">or paste an image URL</div>
        <Input
          type="text"
          placeholder="https://..."
          value={postModal.data.image}
          onChange={(e) =>
            setPostModal((prev) => ({
              ...prev,
              data: { ...prev.data, image: e.target.value },
            }))
          }
        />
        {postModal.data.image && (
          <img
            src={postModal.data.image}
            alt="Preview"
            className="w-full h-40 object-cover rounded-md border mt-2"
          />
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={closePostModal}>Cancel</Button>
        <Button onClick={submitPost}>
          {postModal.mode === 'create' ? 'Post' : 'Save'}
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

{/* CREATE POST DIALOG */}
<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create New Post</DialogTitle>
    </DialogHeader>

    <div className="flex flex-col gap-4">
      {/* Caption */}
      <Textarea
        placeholder="Write a caption..."
        value={newPost.caption}
        onChange={(e) =>
          setNewPost((prev) => ({ ...prev, caption: e.target.value }))
        }
      />

      {/* Image URL (you’ll replace with upload logic) */}
            <div>
                          <Label>Image</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            required
                          />
                        </div>
                {image && (
                  <img src={image} alt="Background preview" className="w-24 h-24 rounded-full mt-2" />
                )}

      <Button onClick={handleCreatePost}>Post</Button>
    </div>
  </DialogContent>
</Dialog>

            {/* Comments modal (like PostsPage) */}
  <Dialog open={!!openPost} onOpenChange={() => setOpenPost(null)}>
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Comments</DialogTitle>
      </DialogHeader>
      {openPost && (
        <div className="space-y-3">
          {openPost.image && <img src={openPost.image} alt="Post" className="rounded-lg w-full mb-2" />}
          <p className="text-gray-700">{openPost.caption}</p>

          {/* All comments */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {openPost.comments?.length > 0 ? (
              openPost.comments.map((comment) => (
                <div key={comment.id} className="border-b pb-1 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold">{comment.user?.username}</p>
                    <p className="text-sm text-gray-600">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0"
                      onClick={() => handleCommentLikeToggle(openPost.id, comment.id)}
                    >
                      {comment.is_liked ? (
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      ) : (
                        <Heart className="w-4 h-4 text-gray-500" />
                      )}
                    </Button>
                    <span className="text-xs">{comment.like_count}</span>
                  </div>
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
                setCommentText({ ...commentText, [openPost.id]: e.target.value })
              }
              className="flex-1"
            />
            <Button onClick={() => handleCommentSubmit(openPost.id)}>Post</Button>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
      </TabsContent>


           <TabsContent value="courses">
              {Array.isArray(courses) && courses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {courses.map((course) => (
                    <Card
                      key={course.id}
                      className="shadow-lg rounded-2xl overflow-hidden"
                    >
                      {/* Course Thumbnail */}
                      {course.post.image && (
                        <img
                          src={course.post.image}
                          alt="Course"
                          className="w-full h-48 object-cover"
                        />
                      )}
    
                      <div className="p-3 space-y-2">
                        {/* Course Title & Caption */}
                        <h3 className="text-lg font-semibold">{course.post.caption}</h3>
                        
    
                        {/* Rating stars */}
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-lg ${
                                star <= course.rating ? "text-yellow-400" : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
    
                        {/* Like & Comment Buttons */}
                        <div className="flex items-center justify-between w-full mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0"
                            onClick={() => handleLikeToggle(course.id)}
                          >
                            {course.is_liked ? (
                              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                            ) : (
                              <Heart className="w-5 h-5 text-gray-500" />
                            )}
                          </Button>
                          <span className="text-sm">{course.like_count} likes</span>
    
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0"
                            onClick={() => setOpenPost(course)}
                          >
                            <MessageCircle className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
              <p className="text-muted-foreground text-center mt-6">
                  No courses yet.
                </p>
              )}
          </TabsContent>

          <TabsContent value="reviews">
            <p className="text-muted-foreground text-center mt-6">No reviews yet.</p>
          </TabsContent>
        </Tabs>
      </div>
    </CreatorLayout>
  );
}
