import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart,MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { deletePost } from "@/endpoints/axios";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "@/components/Layouts/AdminLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,DialogDescription } from "@/components/ui/dialog";

export const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [next, setNext] = useState(null); // next page URL for pagination
  const [openPost, setOpenPost] = useState(null);

  const LIMIT = 6; // items per page

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (url = null) => {
    try {
      setLoading(true);
      const apiUrl = url || `http://localhost:8000/api/creator/posts/?limit=${LIMIT}`;
      const res = await axios.get(apiUrl, { withCredentials: true });
      const data = res.data;

      // Append new posts if this is not the first fetch
      if (posts.length > 0 && data.results) {
        setPosts((prev) => [...prev, ...data.results]);

      } else {
        setPosts(data.results || []);
      }
      setNext(data.next); // store next page URL
      setLoading(false);
    } catch (err) {
      console.error("Error fetching posts:", err);
      toast.error("Failed to fetch posts");
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    const res = await deletePost(postId);
    if (res.success) {
      toast.success("Post deleted successfully");
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } else {
      toast.error("Failed to delete post");
    }
  };
useEffect(() => {
  let fetching = false;

  const handleScroll = async () => {
    if (
      !fetching &&
      next &&
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500
    ) {
      fetching = true;
      await fetchPosts(next);
      fetching = false;
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [next]);



  if (loading && posts.length === 0) return <Skeleton className="w-full h-96" />;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">All Posts</h1>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="shadow-lg rounded-2xl overflow-hidden">
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardContent className="p-3">
                  <strong className="text-lg font-semibold">{post.caption}</strong>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="p-0">
                        {post.is_liked ? (
                          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        ) : (
                          <Heart className="w-5 h-5 text-gray-500" />
                        )}
                      </Button>
                      <span className="text-sm">{post.like_count} likes</span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      Delete
                    </Button>
                    <Button
                          variant="ghost"
                          size="sm"
                          className="p-0"
                          onClick={() => setOpenPost(post)}
                        >
                          <MessageCircle className="w-5 h-5" />
                        </Button>
                  </div>

                  <div className="mt-2">
                    {post.comments?.length > 0 ? (
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">
                          {post.comments[0].user?.username}:
                        </span>{" "}
                        {post.comments[0].content}
                        {post.comments.length > 1 && (
                          <span className="text-xs text-gray-500 ml-2">+ more</span>
                        )}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">No comments yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No posts available.</p>
        )}

        {loading && posts.length > 0 && <Skeleton className="w-full h-40 mt-4" />}

                {/* Comments modal (like PostsPage) */}
  <Dialog open={!!openPost} onOpenChange={() => setOpenPost(null)}>
    <DialogContent className="max-h-[80vh] overflow-y-auto max-w-lg">
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

        </div>
      )}
    </DialogContent>
  </Dialog>
      </div>
    </AdminLayout>
  );
};
