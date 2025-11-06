import React, { useState,useEffect } from 'react';
import { logout } from "../endpoints/axios";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CreatorLayout from '@/components/Layouts/CreatorLayout';
import LearnerBanner from '../assets/learner-banner.jpg';
import { useSelector } from 'react-redux';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { sendContactMessage } from '@/endpoints/axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,DialogDescription } from "@/components/ui/dialog";
import axios from "axios";
import { Heart, MessageCircle } from "lucide-react";

const communities = [
  { id: 1, name: "Batch Alpha - Fabindia", description: "Active Learning Group", messages: 3 },
  { id: 2, name: "Batch Beta - Zudio", description: "Python Enthusiasts", messages: 1 },
  { id: 3, name: "Batch Gamma - Nykaa", description: "UI/UX Designers", messages: 0 },
];

const stats = [
  { label: "Learners", value: "12,000+" },
  { label: "Creators", value: "2,300+" },
  { label: "Live Sessions", value: "150+" },
];

const team = [
  { name: "Ravi Kumar", role: "Frontend Developer", img: "https://i.pravatar.cc/120?img=10" },
  { name: "Anita Desai", role: "Project Manager", img: "https://i.pravatar.cc/120?img=15" },
  { name: "Dr. Sanjay Mehta", role: "Head of Learning", img: "https://i.pravatar.cc/120?img=8" },
];

export const CreatorHome = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const user = useSelector((state) => state.user.user);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [openPost, setOpenPost] = useState(null);
useEffect(() => {
      fetchPosts(1);
}, []);
  const fetchPosts = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/admin/posts/latest`, { withCredentials: true });
      console.log("Fetched posts:", res.data);
      setPosts([...res.data]);
    } catch (err) {
      console.error("Posts fetch error:", err);
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

const handleContactUs = async () => {
  if (!message.trim()) {
    toast.error("Please write a message before sending.");
    return;
  }

  try {
    const res = await sendContactMessage({ content: message, userId: user.id });

    if (res.success) {
      toast.success("Message sent to admin successfully");
      setMessage("");
    } else {
      toast.error("Failed to send message");
    }
  } catch (err) {
    console.error("Error sending message:", err);
    toast.error("Something went wrong");
  }
};
  return (
    <CreatorLayout>
      {/* Banner */}
      <div
        className="w-full bg-cover bg-center h-48 rounded-lg mb-6 flex items-center justify-center text-white shadow"
        style={{ backgroundImage: `url(${LearnerBanner})` }}
      >
        <div className="bg-black/50 p-4 rounded text-center">
          <h1 className="text-2xl font-bold">Welcome to the Creator Zone</h1>
          <p className="text-sm">Inspire. Create. Connect. — For every passionate Creator.</p>
        </div>
      </div>

      {/* Buttons
      <div className="flex gap-4 mb-6">
        <Button variant="custom" onClick={handleLogout}>Logout</Button>
        <Button variant="success" onClick={() => navigate('/')}>Menu</Button>
      </div> */}

      {/* Sponsored Ad Section */}
      <div className="bg-[#fff3f3] p-6 mb-6 border-l-4 border-[#f2709c] shadow">
        <h2 className="text-xl font-semibold mb-2">Sponsored: SkillNest Partnered with Canva Pro</h2>
        <p>Level up your designs with <strong>Canva Pro FREE for Creators</strong>. Access premium templates and share your creativity!</p>
      </div>

      <div className="mb-10">
            {/* Latest Posts */}
              <div className="space-y-4">
                <CardHeader><CardTitle>Latest Posts</CardTitle></CardHeader>
                
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
                                  <Button variant="ghost" size="sm" className="p-0" >
                                    {post.is_liked ? (
                                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                                    ) : (
                                      <Heart className="w-5 h-5 text-gray-500" />
                                    )}
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
                                      
                            
                            </div>
                       
                          </Card>
                          
                        ))}
        
        
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center mt-6">No posts available.</p>
                    )}
                {/* <div className="text-center">
                  <Button onClick={loadMore}>Load More</Button>
                </div> */}
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
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={()=>navigate('/')}>See All</Button>
        </div>
      </div>
      {/* About Us Section */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-blue-50 p-10 rounded-2xl shadow-lg mb-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-gray-800">
            Welcome to <span className="text-3xl font-extrabold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1] bg-clip-text text-transparent">SkillNest</span> ✨
          
          </h2>
          <p className="text-lg text-gray-600">
            <span className="font-semibold">Where Creativity Finds Its Community.</span>
          </p>

          {/* About SkillNest */}
          <div className="bg-white p-6 rounded-xl shadow-sm text-left space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 border-l-4 border-purple-500 pl-3">
              About SkillNest: Your Home for Creativity and Community
            </h3>
            <p className="text-gray-600 leading-relaxed">
              At SkillNest, we believe that the most amazing creations often come from the most 
              unexpected places—from the passionate hobbyist in a small town to the self-taught artisan. 
              We noticed a surge of incredible talent in our own communities, people who have mastered 
              unique skills but lacked a platform to share their gifts with the world.
            </p>
            <p className="text-gray-600 leading-relaxed">
              That’s why we created SkillNest: a dedicated space for these unsung creators. Our mission 
              is to bridge the gap between those who have knowledge to share and those eager to learn, 
              empowering everyone to connect, create, and grow together.
            </p>
          </div>

          {/* Creator & Learner Highlights */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
              <h4 className="text-xl font-semibold text-purple-600 mb-3">🌟 For Our Creators</h4>
              <ul className="space-y-2 text-gray-600 list-disc list-inside">
                <li>Your Community, Your Way: Register, build your profile, and grow your own community.</li>
                <li>Teach and Inspire: Host live video/audio calls, and give personalized feedback.</li>
                <li>Showcase Your Talent: Share new creations, post announcements, and connect with your audience.</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
              <h4 className="text-xl font-semibold text-blue-600 mb-3">📘 For Our Learners</h4>
              <ul className="space-y-2 text-gray-600 list-disc list-inside">
                <li>Discover Your Passion: Learn unique skills taught by real people.</li>
                <li>Learn from the Masters: Join communities led by skilled creators.</li>
                <li>Grow and Connect: Engage in a supportive, like-minded environment.</li>
              </ul>
            </div>
          </div>

          {/* Vision Section */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-xl shadow mt-10">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">🌍 Our Vision</h3>
            <p className="text-gray-700">
              To be the global home for every creator, transforming unique talents into powerful, 
              teachable skills that inspire and connect people worldwide.
            </p>
          </div>

          {/* CTA Button */}
          <div className="mt-8">
            <Button className="px-8 py-3 rounded-full text-lg font-semibold shadow-md hover:scale-105 transition bg-purple-600 text-white">
              Join as a Creator
            </Button>
          </div>
        </div>
      </section>

{/* Contact Us Section */}
<section className="bg-white p-6 rounded shadow mb-8">
  <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">📩 Contact Us</h2>
  <p className="text-sm text-gray-600 text-center mb-6">
    Have questions, feedback, or suggestions? We’d love to hear from you!
  </p>
  
  <div className="max-w-lg mx-auto space-y-4">
    <Textarea
      placeholder="Write your message here..."
      value={message}
        onChange={(e) => setMessage(e.target.value)}   
        className="min-h-[120px] resize-none"
    />
    <Button 
      className="w-full bg-gradient-to-r from-pink-400 via-teal-400 to-sky-400 text-white font-semibold shadow hover:opacity-90"
        onClick={handleContactUs}
      >
        Send to Admin
    </Button>
  </div>
</section>
      {/* Community Stats */}
      <div className="bg-white rounded-lg shadow p-6 text-center mb-10">
        <h2 className="text-xl font-semibold">Our Growing Community</h2>
        <div className="flex justify-around mt-4">
          {stats.map((s, index) => (
            <div key={index}>
              <div className="text-2xl font-bold text-[#2a9a93]">{s.value}</div>
              <p>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="text-center mb-10">
        <h2 className="text-xl font-semibold mb-6">Meet Our Team</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {team.map((member, index) => (
            <div key={index} className="text-center">
              <img src={member.img} alt={member.name} className="w-28 h-28 rounded-full mx-auto mb-2 object-cover" />
              <p className="font-semibold">{member.name}</p>
              <p className="text-sm text-gray-600">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </CreatorLayout>
  );
};
