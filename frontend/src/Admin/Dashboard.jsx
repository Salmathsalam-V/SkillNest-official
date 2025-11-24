import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, User, Users, Gem, DollarSign } from "lucide-react"; // Added icons for stat cards
import { toast } from "sonner";
import { deletePost } from "@/endpoints/axios";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";

// Define an elegant and soft color palette for the charts
const COLORS = ["#7B68EE", "#4ECDC4", "#FF6B6B", "#FF9F1C"]; // Medium Slate Blue, Medium Turquoise, Light Coral, Orange

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-xl text-sm font-semibold text-gray-800">
                <p className="font-bold text-gray-500 mb-1">{label}</p>
                {payload.map((item, index) => (
                    <p key={index} className="text-sm" style={{ color: item.color }}>
                        {`${item.name || item.dataKey}: ${item.value}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Custom formatter for the Revenue tooltip
const RevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-xl text-sm font-semibold text-gray-800">
                <p className="font-bold text-gray-500 mb-1">{label}</p>
                <p style={{ color: COLORS[3] }}>
                    Revenue: ₹{payload[0].value.toLocaleString("en-IN")}
                </p>
            </div>
        );
    }
    return null;
};


export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [posts, setPosts] = useState([]);
    // Removed unused 'page' state and 'loadMore' logic for simplicity, focusing on initial fetch
    const [loading, setLoading] = useState(true);
    const [openPost, setOpenPost] = useState(null);

    useEffect(() => {
        fetchStats();
        fetchPosts();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get("https://api.skillnestco.xyz/api/admin/dashboard/stats/", { withCredentials: true });
            setStats(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Stats fetch error:", err);
            // Optionally set dummy data here if loading fails to prevent crash
        }
    };

    const fetchPosts = async () => {
        try {
            const res = await axios.get(`https://api.skillnestco.xyz/api/admin/posts/latest`, { withCredentials: true });
            setPosts(res.data);
        } catch (err) {
            console.error("Posts fetch error:", err);
        }
    };

    const handleDeletePost = async (postId) => {
        const res = await deletePost(postId);
        if (res.success) {
            toast.success("Post deleted successfully");
            setPosts((prev) => prev.filter((p) => p.id !== postId));
        } else {
            toast.error("Failed to delete post");
        }
    };

    if (loading) return <div className="p-8 space-y-4"><Skeleton className="w-full h-40"/><Skeleton className="w-full h-80"/><Skeleton className="w-full h-80"/></div>;

    const pieData = [
        { name: "Creators", value: stats.creators },
        { name: "Learners", value: stats.learners },
    ];

    // Define the Statistic Card props
    const StatCard = ({ title, value, icon: Icon, colorClass, bgColorClass }) => (
        <Card className={`shadow-xl ${bgColorClass} border-l-4 ${colorClass} transition-transform duration-300 ease-in-out transform hover:scale-[1.02]`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${colorClass} uppercase tracking-wider`}>
                    {title}
                </CardTitle>
                <Icon className={`h-6 w-6 ${colorClass}`} />
            </CardHeader>
            <CardContent>
                <div className={`text-4xl font-extrabold ${colorClass}`}>
                    {value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {/* Placeholder for growth/delta */}
                    +15% since last month
                </p>
            </CardContent>
        </Card>
    );


    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 border-b pb-4">
                Dashboard Overview
            </h1>

            {/* Header Cards - Enhanced Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Users" 
                    value={stats.total_users} 
                    icon={Users} 
                    colorClass="text-[#7B68EE]" // Soft Blue
                    bgColorClass="bg-[#F0F8FF] shadow-indigo-100"
                />
                <StatCard 
                    title="Creators" 
                    value={stats.creators} 
                    icon={Gem} 
                    colorClass="text-[#4ECDC4]" // Teal
                    bgColorClass="bg-[#E0FFFF] shadow-teal-100"
                />
                <StatCard 
                    title="Learners" 
                    value={stats.learners} 
                    icon={User} 
                    colorClass="text-[#FF6B6B]" // Coral
                    bgColorClass="bg-[#FFF0F5] shadow-pink-100"
                />
                <StatCard 
                    title="Communities" 
                    value={stats.communities} 
                    icon={MessageCircle} 
                    colorClass="text-[#FF9F1C]" // Orange
                    bgColorClass="bg-[#FFFBEB] shadow-yellow-100"
                />
            </div>

            {/* Revenue + User Growth + Distribution Section */}
<div className="space-y-8">
  {/* Total Revenue Card */}
  <div className="max-w-sm">
    <StatCard 
      title="Total Revenue" 
      value={`₹${stats.total_revenue.toLocaleString("en-IN")}`} 
      icon={DollarSign} 
      colorClass="text-green-600"
      bgColorClass="bg-green-50 shadow-green-100"
    />
  </div>

  {/* User Growth Chart */}
  <Card className="shadow-lg transition-shadow duration-300 hover:shadow-xl">
    <CardHeader>
      <CardTitle className="text-xl font-semibold">User Growth</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={stats.user_growth} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <XAxis dataKey="date" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            name="New Users"
            stroke="#7B68EE"
            strokeWidth={3}
            dot={{ stroke: "#7B68EE", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>

  {/* User Distribution Pie Chart */}
  <Card className="shadow-lg transition-shadow duration-300 hover:shadow-xl">
    <CardHeader>
      <CardTitle className="text-xl font-semibold">User Distribution</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: "10px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
</div>

            
            {/* Community Growth Chart */}
            <Card className="shadow-lg transition-shadow duration-300 hover:shadow-xl">
                <CardHeader><CardTitle className="text-xl font-semibold">Community Growth</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.community_growth} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <XAxis dataKey="date" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="count" name="New Communities" stroke="#4ECDC4" strokeWidth={3} dot={{ stroke: '#4ECDC4', strokeWidth: 2, r: 4 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Payment Growth Chart */}
            <Card className="shadow-lg transition-shadow duration-300 hover:shadow-xl">
                <CardHeader><CardTitle className="text-xl font-semibold">Payment Revenue Over Time</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.payment_growth} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <XAxis dataKey="date" stroke="#6b7280" />
                            <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} stroke="#6b7280" />
                            <Tooltip content={<RevenueTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="amount" name="Revenue" stroke="#FF9F1C" strokeWidth={3} dot={{ stroke: '#FF9F1C', strokeWidth: 2, r: 4 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>


            {/* Latest Posts - Enhanced Grid */}
            <div className="space-y-4 pt-6">
                <CardHeader className="pl-0"><CardTitle className="text-2xl font-bold">Latest Platform Activity</CardTitle></CardHeader>
                
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Card key={post.id} className="shadow-xl rounded-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                                
                                {/* Post Author Info */}
                                {post.user && (
                                    <div className="flex items-center p-4 gap-3 border-b border-gray-100">
                                        <img
                                            src={post.user.profile || "/default-avatar.png"}
                                            alt={post.user.username}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-[#7B68EE]"
                                        />
                                        <div>
                                            <span className="font-bold text-gray-800">{post.user.username}</span>
                                            <p className="text-xs text-gray-500">Posted on {new Date(post.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Post Image */}
                                {post.image && (
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt="Post Content"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                                
                                {/* Post Content and Actions */}
                                <CardContent className="p-4 space-y-3">
                                    <p className="text-lg font-semibold text-gray-700 line-clamp-2">{post.caption}</p>

                                    {/* Stats and Action Buttons */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        
                                        <div className="flex items-center gap-4 text-gray-500">
                                            {/* Likes */}
                                            <div className="flex items-center gap-1 font-medium">
                                                <Heart className="w-5 h-5 text-red-500 fill-red-100" />
                                                <span className="text-sm">{post.like_count}</span>
                                            </div>
                                            {/* Comments count (assuming you have a count in the data) */}
                                            <div className="flex items-center gap-1 font-medium">
                                                <MessageCircle className="w-5 h-5 text-[#7B68EE]" />
                                                <span className="text-sm">{post.comments?.length || 0}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {/* View Comments Button (Dialog Trigger) */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-[#7B68EE] text-[#7B68EE] hover:bg-[#7B68EE] hover:text-white"
                                                onClick={() => setOpenPost(post)}
                                            >
                                                View
                                            </Button>

                                            {/* Delete Button */}
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeletePost(post.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-lg text-gray-500 py-10 border rounded-lg bg-white shadow-sm">
                        No recent posts available to display.
                    </p>
                )}
                
            </div>
            
            {/* Comments Modal (Dialog) */}
            <Dialog open={!!openPost} onOpenChange={setOpenPost}>
                <DialogContent className="max-h-[80vh] overflow-hidden max-w-xl p-0">
                    <div className="grid grid-cols-2 divide-x h-full">
                        {/* Left Side: Post Content */}
                        <div className="flex flex-col">
                            <DialogHeader className="p-4 border-b">
                                <DialogTitle className="text-xl">Post Details</DialogTitle>
                                <DialogDescription className="text-sm text-gray-500">
                                    {openPost?.user?.username}'s Post
                                </DialogDescription>
                            </DialogHeader>
                            <div className="p-4 overflow-y-auto flex-1">
                                {openPost?.image && <img src={openPost.image} alt="Post" className="rounded-lg w-full mb-4 shadow-md" />}
                                <p className="text-base text-gray-800 font-semibold">{openPost?.caption}</p>
                            </div>
                        </div>

                        {/* Right Side: Comments */}
                        <div className="flex flex-col">
                            <DialogHeader className="p-4 border-b">
                                <DialogTitle className="text-xl">Comments ({openPost?.comments?.length || 0})</DialogTitle>
                            </DialogHeader>
                            <div className="p-4 space-y-3 overflow-y-auto flex-1">
                                {openPost?.comments?.length > 0 ? (
                                    openPost.comments.map((comment) => (
                                        <div key={comment.id} className="p-3 rounded-lg bg-gray-50 shadow-sm border border-gray-100">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 text-xs font-bold flex items-center justify-center">
                                                        {comment.user?.username[0]}
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-800">{comment.user?.username}</p>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Heart className="w-3 h-3 text-red-400 fill-red-100" />
                                                    {comment.like_count}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 mt-1 pl-8">{comment.content}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-base text-gray-400 text-center pt-8">Be the first to comment!</p>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}