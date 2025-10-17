import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CreatorLayout from '@/components/Layouts/CreatorLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,DialogDescription } from "@/components/ui/dialog";
import { Heart, MessageCircle } from "lucide-react";
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { toggleFollow,toggleLike,createComment,toggleCommentLike,get_course, creatorData, getCreatorPosts } from '../endpoints/axios';

export function CreatorDetailpage() {
  const { id } = useParams();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openPost, setOpenPost] = useState(null);
  const [courses, setCourses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const response = await creatorData(id);
        console.log("Fetched creator: from cr view", response.data);
        if (response.data.success) {
          setCreator(response.data.creator);
        } else {
          setError("Creator not found");
        }
      } catch (err) {
        console.error("Failed to fetch creator:", err);
        setError("Something went wrong while loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCreator();
  }, [id]);

    useEffect(() => {
  const fetchCreatorData = async () => {
    try {
      const resPosts = await getCreatorPosts(id);
      console.log("Posts fetched:", resPosts.data);
      setPosts(resPosts.data || []);
      console.log("creatoriid : ", id);
      try{
        const resCourses = await get_course(id);
        setCourses(resCourses);
        console.log("Courses fetched:", courses,resCourses[0]);

      }
      catch(err){
        console.error("Error fetching courses:", err);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching creator posts/courses:", err);
    }
  };
  fetchCreatorData();
}, [id]);

 
const handleFollowToggle = async () => {
  try {
    const data = await toggleFollow(creator.id);
    if (data.success) {
      setCreator((prev) => ({
        ...prev,
        is_following: data.following,
        follower_count: data.follower_count,
      }));
    }
  } catch (err) {
    console.error("Follow/unfollow failed:", err);
    toast.error("Something went wrong. Try again.");
  }
};

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
  {/* Optional overlay for better contrast */}
  <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-blue-100 opacity-80 z-0"></div>

      {/* Content over image */}
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
          <p className="text-gray-600 text-sm mb-1">Category: {creator.category}</p>
          <p className="text-gray-700">{creator.description}</p>
          <p className="text-sm mt-1">{creator.follower_count} followers</p>
        </div>

        <Button
          variant={creator.is_following ? "secondary" : "custom"}
          onClick={handleFollowToggle} 
        >
          {creator.is_following ? "Unfollow" : "Follow"}
        </Button>
        <Button variant="custom">Connect</Button>
      </Card>

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

                      {/* First Comment */}
                      <div>
                        {post.comments?.length > 0 ? (
                          <>
                            <p className="text-sm">
                              <span className="font-semibold">
                                {post.comments[0].user.username}:
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
                    <p className="text-gray-700">{openPost.caption}{openPost.id}</p>

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

