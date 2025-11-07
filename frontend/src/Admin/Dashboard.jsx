import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { deletePost } from "@/endpoints/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,DialogDescription } from "@/components/ui/dialog";


export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openPost, setOpenPost] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchPosts(1);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/admin/dashboard/stats/", { withCredentials: true });
      console.log("Fetched stats:", res.data);
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/admin/posts/latest`, { withCredentials: true });
      console.log("Fetched posts:", res.data);
      setPosts([...res.data]);
    } catch (err) {
      console.error("Posts fetch error:", err);
    }
  };
  const handleDeletePost = async (postId) => {
  // if (!window.confirm("Are you sure you want to delete this post?")) return;

  const res = await deletePost(postId);
  if (res.success) {
    toast.success("Post deleted successfully");
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  } else {
    toast.error("Failed to delete post");
  }
};

useEffect(() => {
    // Now 'posts' holds the fully updated array!
    console.log("Updated posts state in useEffect:", posts);
}, [posts]);
  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next);
  };

  if (loading) return <Skeleton className="w-full h-96" />;

  const pieData = [
    { name: "Creators", value: stats.creators },
    { name: "Learners", value: stats.learners },
  ];
  const COLORS = ["#8884d8", "#82ca9d"];

  return (
    <div className="p-6 space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Total Users */}
  <Card className="bg-blue-50 border-none shadow-md hover:shadow-lg transition-shadow duration-300">
    <CardHeader>
      <CardTitle className="text-blue-800">Total Users</CardTitle>
    </CardHeader>
    <CardContent className="text-3xl font-semibold text-blue-900">
      {stats.total_users}
    </CardContent>
  </Card>

  {/* Creators */}
  <Card className="bg-pink-50 border-none shadow-md hover:shadow-lg transition-shadow duration-300">
    <CardHeader>
      <CardTitle className="text-pink-800">Creators</CardTitle>
    </CardHeader>
    <CardContent className="text-3xl font-semibold text-pink-900">
      {stats.creators}
    </CardContent>
  </Card>

  {/* Learners */}
  <Card className="bg-green-50 border-none shadow-md hover:shadow-lg transition-shadow duration-300">
    <CardHeader>
      <CardTitle className="text-green-800">Learners</CardTitle>
    </CardHeader>
    <CardContent className="text-3xl font-semibold text-green-900">
      {stats.learners}
    </CardContent>
  </Card>

  {/* Communities */}
  <Card className="bg-purple-50 border-none shadow-md hover:shadow-lg transition-shadow duration-300">
    <CardHeader>
      <CardTitle className="text-purple-800">Communities</CardTitle>
    </CardHeader>
    <CardContent className="text-3xl font-semibold text-purple-900">
      {stats.communities}
    </CardContent>
  </Card>
</div>


      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader><CardTitle>User Growth</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.user_growth}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4ade80" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>User Type Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Community Growth */}
      <Card>
        <CardHeader><CardTitle>Community Growth</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.community_growth}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#60a5fa" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Payment Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.payment_growth}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
              <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="bg-yellow-50 border-none shadow-md hover:shadow-lg transition-shadow duration-300">
  <CardHeader>
    <CardTitle className="text-yellow-800">Total Revenue</CardTitle>
  </CardHeader>
  <CardContent className="text-3xl font-semibold text-yellow-900">
    ₹{stats.total_revenue}
  </CardContent>
</Card>

      {/* Latest Posts */}
      <div className="space-y-4">
        <CardHeader><CardTitle>Latest Posts</CardTitle></CardHeader>
        
        {posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {posts.map((post) => (
                  <Card key={post.id} className="shadow-lg rounded-2xl overflow-hidden">
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
              <p className="text-muted-foreground text-center mt-6">No posts available.</p>
            )}
        
      </div>
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
  );
}
