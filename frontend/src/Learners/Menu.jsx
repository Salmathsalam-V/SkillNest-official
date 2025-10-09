import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, MessageCircle } from "lucide-react";
import { toggleLike,createComment,toggleCommentLike } from '../endpoints/axios';
import { toast } from 'sonner';
import LearnerLayout from "@/components/Layouts/LearnerLayout";
import CreatorLayout from "@/components/Layouts/CreatorLayout";
import AdminLayout from "@/components/Layouts/AdminLayout";
import { Loader }  from '@/components/Layouts/Loader';
export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(true);
  const [openPost, setOpenPost] = useState(null);
  const user = useSelector((state) => state.user.user); // get user from redux
  const userType = user?.user_type;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/creator/posts/", {
          withCredentials: true,
        });
        console.log("Fetched posts:", res.data.results);
        setPosts(res.data.results);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleLikeToggle = async (postId) => {
  try {
    const data = await toggleLike(postId);
    if (data.success) {
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId ? { ...p, is_liked: data.liked, like_count: data.like_count } : p
        )
      );
    }
  } catch (err) {
    console.error("Like/unlike failed:", err);
    toast.error("Something went wrong. Try again.");
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


const handleCommentLikeToggle = async (postId, commentId) => {
  console.log("Toggling like for comment:", commentId, "on post:", postId);
  try {
    const data = await toggleCommentLike(postId, commentId);
    console.log("Comment like toggle response:", data);
    if (data.success) {
      // Update state for that comment
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: p.comments.map((c) =>
                  c.id === commentId
                    ? { ...c, is_liked: data.liked, like_count: data.like_count }
                    : c
                ),
              }
            : p
        )
      );

      // Also update openPost if the dialog is open
      if (openPost?.id === postId) {
        setOpenPost((prev) => ({
          ...prev,
          comments: prev.comments.map((c) =>
            c.id === commentId
              ? { ...c, is_liked: data.liked, like_count: data.like_count }
              : c
          ),
        }));
      }
    }
  } catch (err) {
    console.log("Comment like toggle error:", err);
    toast.error("Failed to like comment");
  }
};

  if (loading) return <Loader text="Loading posts..." />; // or redirect to login

  // ✅ Decide layout
  let Layout;
  if (userType === "learner") {
    Layout = LearnerLayout;
  } else if (userType === "creator") {
    Layout = CreatorLayout;
  } else {
    Layout = AdminLayout; // default
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto mt-10">
        {/* Grid 4 in row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-48 object-cover"
                  />
                )}
              </CardContent>
              <CardFooter className="flex flex-col items-start w-full space-y-2 p-3">
                <span className="text-sm">{post.caption}</span>
                {/* Like & comment buttons */}
                <div className="flex items-center justify-between w-full">
                  <Button
                      variant="ghost"
                      size="sm"
                      className="p-0"
                      onClick={() => handleLikeToggle(post.id)}
                  >
                      {post.is_liked ? (
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" /> // filled
                      ) : (
                        <Heart className="w-5 h-5 text-gray-500" /> // outline
                      )}
                  </Button>
                  <span className="text-sm">{post.like_count} likes</span>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0"
                    onClick={() => setOpenPost(post)}
                  >
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                </div>

                {/* Show only first comment */}
                <div className="w-full">
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

                {/* Rating if is_course */}
                {post.is_course && (
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="cursor-pointer text-yellow-400 text-lg">
                        ★
                      </span>
                    ))}
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Popup for comments */}
      <Dialog open={!!openPost} onOpenChange={() => setOpenPost(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto max-w-lg">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          {openPost && (
            <div className="space-y-3">
              <img src={openPost.image} alt="Post" className="rounded-lg w-full mb-2" />
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
    </Layout>
  );
}
