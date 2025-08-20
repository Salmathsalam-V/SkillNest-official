import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, MessageCircle } from "lucide-react";
import LearnerLayout from "@/components/Layouts/LearnerLayout";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(true);
  const [openPost, setOpenPost] = useState(null); // for popup

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/creator/posts/", { withCredentials: true });
        setPosts(res.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleCommentSubmit = async (postId) => {
    if (!commentText[postId]) return;
    try {
      const res = await axios.post(
        `http://localhost:8000/api/creator/posts/${postId}/comments/`,
        { content: commentText[postId] },
        { withCredentials: true }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: [res.data, ...(post.comments || [])] }
            : post
        )
      );
      setCommentText({ ...commentText, [postId]: "" });
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading posts...</p>;

  return (
    <LearnerLayout>
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
                {/* Like & comment buttons */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="p-0">
                      <Heart className="w-5 h-5 text-red-500" />
                    </Button>
                    <span className="text-sm">{post.like_count} likes</span>
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
        <DialogContent className="max-w-lg">
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
                    <div key={comment.id} className="border-b pb-1">
                      <p className="text-sm font-semibold">{comment.user?.username}</p>
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
    </LearnerLayout>
  );
}
