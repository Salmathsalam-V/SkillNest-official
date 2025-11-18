import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import {
  toggleLike,
  createComment,
  toggleCommentLike,
  postReports,
} from "@/endpoints/axios";
import { toast } from "sonner";
import LearnerLayout from "@/components/Layouts/LearnerLayout";
import CreatorLayout from "@/components/Layouts/CreatorLayout";
import AdminLayout from "@/components/Layouts/AdminLayout";
import { Loader } from "@/components/Layouts/Loader";
import { Menu } from "@headlessui/react";

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(true);
  const [next, setNext] = useState(null);
  const [openPost, setOpenPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [currentPostId, setCurrentPostId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const user = useSelector((state) => state.user.user);
  const userType = user?.user_type;
  const LIMIT = 6;

  const fetchingRef = useRef(false);
  const nextRef = useRef(null);

const filteredPosts = posts
  .filter((post) => post.caption?.toLowerCase().includes(searchTerm.toLowerCase()))
  .filter((post) => {
    if (filterType === "course") return post.is_course === true;
    if (filterType === "normal") return post.is_course === false;
    return true;
  });


  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (url = null) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      setLoading(true);
      const apiUrl =
        url || `http://localhost:8000/api/creator/posts/?limit=${LIMIT}`;
      const res = await axios.get(apiUrl, { withCredentials: true });
      const data = res.data;

      setPosts((prev) => {
        const newPosts = data.results?.filter(
          (p) => !prev.some((existing) => existing.id === p.id)
        );
        return url ? [...prev, ...newPosts] : newPosts;
      });

      setNext(data.next);
      nextRef.current = data.next;
    } catch (err) {
      console.error("Error fetching posts:", err);
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    const handleScroll = async () => {
      if (
        !fetchingRef.current &&
        nextRef.current &&
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400
      ) {
        await fetchPosts(nextRef.current);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLikeToggle = async (postId) => {
    try {
      const data = await toggleLike(postId);
      if (data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? { ...p, is_liked: data.liked, like_count: data.like_count }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Like/unlike failed:", err);
      toast.error("Something went wrong. Try again.");
    }
  };

  const handleCommentSubmit = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    const res = await createComment(postId, text);
    if (res.success) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: [res.data, ...p.comments] }
            : p
        )
      );
      toast.success("Comment posted");
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
    } else {
      toast.error("Failed to post comment");
    }
  };

  const handleCommentLikeToggle = async (postId, commentId) => {
    try {
      const data = await toggleCommentLike(postId, commentId);
      if (data.success) {
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
      toast.error("Failed to like comment");
    }
  };

  // ✅ Replace prompt() with modal logic
  const handleOpenReportModal = (postId) => {
    setCurrentPostId(postId);
    setReportReason("");
    setIsModalOpen(true);
  };

  const handleReportSubmit = async () => {
    setIsModalOpen(false)
    if (!reportReason.trim()) {
      toast.error("Please enter a reason for reporting.");
      return;
    }

    try {
      const data = await postReports(currentPostId, { reason: reportReason });
      if (data.success) {
        toast.success("Post reported successfully");
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Report post failed:", err);
      toast.error("Failed to report post");
    }
  };

  if (loading && posts.length === 0) return <Loader text="Loading posts..." />;

  const Layout =
    userType === "learner"
      ? LearnerLayout
      : userType === "creator"
      ? CreatorLayout
      : AdminLayout;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto mt-10 px-4">
        {/* 🔍 Search + Filter */}
<div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mb-6 gap-3">
  <input
    type="text"
    placeholder="Search posts by caption..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full sm:w-1/2 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  />

  <Select value={filterType} onValueChange={setFilterType}>
    <SelectTrigger className="w-40">
      <SelectValue placeholder="Filter by type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Posts</SelectItem>
      <SelectItem value="course">Courses</SelectItem>
      <SelectItem value="normal">Normal Posts</SelectItem>
    </SelectContent>
  </Select>
</div>


        {/* Posts grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPosts.length > 0 ? (
            
            filteredPosts.map((post) => (
              <Card key={post.id} className="shadow-lg rounded-2xl overflow-hidden">
                
                <CardContent className="p-0">
                  {/* Post author info */}
                {post.user && (
                  <div className="flex items-center p-3 gap-3">
                    <img
                      src={post.user.profile || "/default-avatar.png"} // fallback if no profile image
                      alt={post.user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="font-semibold">{post.user.username}</span>
                  </div>
                )}
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

                  <div className="flex items-center justify-between w-full">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0"
                      onClick={() => handleLikeToggle(post.id)}
                    >
                      {post.is_liked ? (
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      ) : (
                        <Heart className="w-5 h-5 text-gray-500" />
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

                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="p-1 rounded-full hover:bg-gray-200">
                        <MoreHorizontal className="w-5 h-5" />
                      </Menu.Button>

                      <Menu.Items className="absolute right-0 mt-2 w-28 bg-white border rounded-md shadow-lg focus:outline-none z-50">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={`${
                                active ? "bg-gray-100" : ""
                              } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                              onClick={() => handleOpenReportModal(post.id)}
                            >
                              Report
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Menu>
                  </div>

                  {/* Show first comment */}
                  <div className="w-full">
                    {post.comments?.length > 0 ? (
                      <>
                        <p className="text-sm">
                          <span className="font-semibold">
                            {post.comments[0].user?.username}:
                          </span>{" "}
                          {post.comments[0].content[70]}...
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
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-400">
              No posts found for "{searchTerm}"
            </p>
          )}
        </div>

        {loading && posts.length > 0 && (
          <p className="text-center mt-4 text-gray-500">Loading more...</p>
        )}
      </div>

      {/* 🟡 Report Post Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Please describe why you are reporting this post:
            </p>
            <Textarea
              placeholder="Enter reason..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
          </div>
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReportSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comments Modal (existing) */}
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
