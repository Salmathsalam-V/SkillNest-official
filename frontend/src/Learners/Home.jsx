import React, { useState, useEffect } from 'react';
import { logout, sendContactMessage } from "../endpoints/axios";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
// import CreatorLayout from '@/components/Layouts/CreatorLayout'; // Not needed in Learner Home
import LearnerLayout from '@/components/Layouts/LearnerLayout';
import LearnerBanner from '../assets/learner1.png'; // Assuming this path is correct
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import axios from "axios";
import { useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle } from "@/components/ui/card"; // CardContent removed as it wasn't used globally
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // DialogTrigger/Description removed if not used
import { Heart, MessageCircle, ArrowRight } from "lucide-react"; // Added ArrowRight for CTA

export const Home = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const user = useSelector((state) => state.user.user);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1); // Page is used but loadMore is commented out, keeping for potential use
  const [openPost, setOpenPost] = useState(null);

  useEffect(() => {
    fetchPosts(1);
  }, []);

  const fetchPosts = async (currentPage) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/admin/posts/latest?page=${currentPage}`, { withCredentials: true });

      setPosts(res.data);
    } catch (err) {
      console.error("Posts fetch error:", err);
      toast.error("Failed to load posts.");
    }
  };


  const handleContactUs = async () => {
    if (!message.trim()) {
      toast.error("Please write a message before sending.");
      return;
    }
    try {
      // API call to send message
      await sendContactMessage(
        { content: message, user: user.id },
        { withCredentials: true }
      );
      toast.success("Message sent to admin successfully");
      setMessage("");
    } catch (err) {
      console.error("Error on sending:", err);
      toast.error("Failed to send message.");
    }
  };

  const team = [
    { name: "Ravi Kumar", role: "Frontend Developer", img: "https://i.pravatar.cc/120?img=10" },
    { name: "Anita Desai", role: "Project Manager", img: "https://i.pravatar.cc/120?img=15" },
    { name: "Dr. Sanjay Mehta", role: "Head of Learning", img: "https://i.pravatar.cc/120?img=8" },
  ];

  return (
    <LearnerLayout>
    {/* Elegant Banner Section (Updated - No Mask & Taller) */}
    <div
      className="w-full h-80 md:h-96 rounded-2xl mb-10 overflow-hidden relative shadow-xl transform transition-transform duration-500 ease-in-out hover:scale-[1.01]"
    >
      {/* Direct banner image without overlay mask */}
      <img
        src={LearnerBanner}
        alt="SkillNest Learning Banner"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Center Text (no dark overlay now) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)]">
          "Learn and upgrade your level"
        </h1>
        <p className="text-lg text-gray-100 font-medium italic drop-shadow-md">
          — Here is your skill-sharpening Nest.
        </p>
       
      </div>
    </div>


      {/* ✨ Elevated Ad Section */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-l-4 border-pink-500 shadow-md p-5 mb-10 rounded-xl transition-shadow hover:shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="text-pink-600 mr-2">🚀</span> Sponsored: SkillNest x Canva Pro
        </h2>
        <p className="text-sm mt-1 text-gray-600">
          Level up your designs with <strong className="text-pink-600">Canva Pro FREE for Creators</strong>. Access premium templates and share your creativity!
        </p>
      </div>

      <section className="mb-12">
        {/* 🎨 Latest Posts Section - Enhanced Card Design */}
        <Card className="shadow-2xl rounded-2xl p-6 bg-white border-none">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-3xl font-bold text-gray-800 border-b pb-2 mb-4">Latest Creations</CardTitle>
          </CardHeader>
          
          <div className="space-y-4">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Card 
                    key={post.id} 
                    className="shadow-xl rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl border border-gray-100"
                  >
                    {/* Post Author Info */}
                    {post.user && (
                      <div className="flex items-center p-4 gap-3 border-b">
                        <img
                          src={post.user.profile || "https://i.pravatar.cc/120?img=50"} // Better fallback avatar
                          alt={post.user.username}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-400 p-[2px]"
                        />
                        <span className="font-bold text-gray-800">{post.user.username}</span>
                      </div>
                    )}
                    
                    {/* Post Image */}
                    {post.image && (
                      <div className="h-52 w-full overflow-hidden">
                        <img
                          src={post.image}
                          alt="Post Content"
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                      </div>
                    )}
                    
                    <div className="p-4 space-y-3">
                        <strong className="text-lg font-semibold block text-gray-900 line-clamp-2">
                           {post.caption}
                        </strong> 
                      
                      {/* Like & Comment Buttons */}
                      <div className="flex items-center justify-between w-full pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="p-0 text-gray-600 hover:text-red-500 transition-colors">
                              {post.is_liked ? (
                                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                              ) : (
                                <Heart className="w-5 h-5" />
                              )}
                            </Button>
                            <span className="text-sm font-medium text-gray-600">{post.like_count}</span>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 text-gray-600 hover:text-blue-500 transition-colors"
                            onClick={() => setOpenPost(post)}
                          >
                            <MessageCircle className="w-5 h-5" />
                          </Button>
                        </div>
                        
                        {/* First Comment Snippet */}
                        {post.comments?.length > 0 && (
                            <button
                                onClick={() => setOpenPost(post)}
                                className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors"
                            >
                                View {post.comments.length} comments
                            </button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center mt-6 p-10 text-lg">No inspiring creations posted yet. Be the first to start learning!</p>
            )}
            
            <div className="text-center pt-8">
              <Button variant="outline" className="px-8 py-2 rounded-full border-2 border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700 font-semibold" onClick={() => navigate('/posts')}>
                See All Posts
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Comments modal */}
        <Dialog open={!!openPost} onOpenChange={setOpenPost}>
          <DialogContent className="max-h-[80vh] overflow-y-auto max-w-lg rounded-xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800">Post Comments</DialogTitle>
            </DialogHeader>
            {openPost && (
              <div className="space-y-4">
                {/* Post Content inside Modal */}
                {openPost.image && <img src={openPost.image} alt="Post" className="rounded-lg w-full mb-3 shadow" />}
                <p className="text-gray-700 font-medium border-b pb-2">{openPost.caption}</p>
                
                {/* All comments */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {openPost.comments?.length > 0 ? (
                    openPost.comments.map((comment) => (
                      <div key={comment.id} className="border-b border-gray-100 pb-2 flex justify-between items-start">
                        <div className="flex-1 pr-4">
                          <p className="text-sm font-bold text-gray-800">{comment.user?.username}</p>
                          <p className="text-sm text-gray-600">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Button variant="ghost" size="sm" className="p-0">
                            {comment.is_liked ? (
                              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                            ) : (
                              <Heart className="w-4 h-4" />
                            )}
                          </Button>
                          <span className="text-xs">{comment.like_count}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 py-4 text-center">No comments yet. Be the first to share your thoughts!</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </section>

      {/* 💎 About Us Section - Clean & Vibrant */}
      <section className="bg-gradient-to-br from-white via-purple-50 to-blue-50 p-12 rounded-3xl shadow-2xl mb-12">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-extrabold text-gray-900">
            Welcome to <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent">SkillNest</span> ✨
          </h2>
          <p className="text-xl text-gray-600 font-medium">
            <span className="font-bold">Where Creativity Finds Its Community.</span>
          </p>

          {/* Core Mission */}
          <div className="bg-white p-8 rounded-2xl shadow-xl text-left space-y-4 border-t-4 border-purple-500">
            <h3 className="text-2xl font-bold text-gray-800">
              Our Mission
            </h3>
            <p className="text-gray-700 leading-relaxed">
              At SkillNest, we bridge the gap between those who have knowledge to share (the **Creators**) and those eager to learn (the **Learners**). We empower everyone—from the passionate hobbyist to the self-taught artisan—to connect, create, and grow together in a dedicated space.
            </p>
          </div>

          {/* Creator & Learner Highlights */}
          <div className="grid md:grid-cols-2 gap-8 mt-10">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-400 hover:shadow-xl transition-shadow">
              <h4 className="text-2xl font-bold text-purple-600 mb-3 flex items-center">
                <span className="text-3xl mr-2">🌟</span> For Our Creators
              </h4>
              <ul className="space-y-2 text-gray-600 list-none text-left pl-0">
                <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-purple-400" /> Your Community, Your Way: Build your profile and community.</li>
                <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-purple-400" /> Teach and Inspire: Host live calls and give personalized feedback.</li>
                <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-purple-400" /> Showcase Your Talent: Share new creations and connect with your audience.</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-400 hover:shadow-xl transition-shadow">
              <h4 className="text-2xl font-bold text-blue-600 mb-3 flex items-center">
                <span className="text-3xl mr-2">📘</span> For Our Learners
              </h4>
              <ul className="space-y-2 text-gray-600 list-none text-left pl-0">
                <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-blue-400" /> Discover Your Passion: Learn unique skills taught by real people.</li>
                <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-blue-400" /> Learn from the Masters: Join supportive communities led by skilled creators.</li>
                <li className="flex items-center"><ArrowRight className="h-4 w-4 mr-2 text-blue-400" /> Grow and Connect: Engage in a supportive, like-minded environment.</li>
              </ul>
            </div>
          </div>

          {/* Vision Section */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-2xl shadow-md mt-10">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">🌍 Our Vision</h3>
            <p className="text-gray-700">
              To be the global home for every creator, transforming unique talents into powerful, teachable skills that inspire and connect people worldwide.
            </p>
          </div>

          {/* CTA Button */}
          <div className="mt-10">
            <Button className="px-10 py-3 rounded-full text-xl font-bold shadow-2xl transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 transform hover:scale-105">
              Join as a Learner Today
            </Button>
          </div>
        </div>
      </section>

      {/* 📊 Stats Section - Clean Design */}
      <section className="bg-white p-8 rounded-2xl shadow-xl mb-12 text-center border-t-2 border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Growing Community</h2>
        <div className="flex justify-center gap-16 flex-wrap">
          <div className="text-center">
            <div className="text-4xl font-extrabold text-purple-600">200+</div>
            <p className="text-lg text-gray-500">Active Learners</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-extrabold text-pink-600">75+</div>
            <p className="text-lg text-gray-500">Skilled Creators</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-extrabold text-blue-600">150+</div>
            <p className="text-lg text-gray-500">Live Sessions Held</p>
          </div>
        </div>
      </section>

      {/* 🤝 Team Section - Professional Look */}
      <section className="bg-white p-8 rounded-2xl shadow-xl text-center mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Meet Our Core Team</h2>
        <div className="flex justify-center gap-10 flex-wrap">
          {team.map((member, index) => (
            <div key={index} className="text-center w-36 p-4 rounded-xl transition-shadow hover:shadow-lg">
              <img
                src={member.img}
                alt={member.name}
                className="w-28 h-28 object-cover rounded-full mx-auto mb-3 shadow-md ring-4 ring-purple-100"
              />
              <p className="font-bold text-gray-900">{member.name}</p>
              <p className="text-sm text-purple-500 font-medium">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 📧 Contact Us Section - Sleek Footer Area */}
      <section className="bg-gray-50 p-8 rounded-2xl shadow-inner mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-5 text-center">📩 Get in Touch</h2>
        <p className="text-md text-gray-600 text-center mb-8">
          Have questions, feedback, or suggestions? Send a direct message to our administrative team.
        </p>
        
        <div className="max-w-xl mx-auto space-y-5">
          <Textarea
            placeholder="Share your thoughts or issues here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px] resize-none border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg shadow-sm"
          />
          <Button
            className="w-full h-12 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-[1.01]"
            onClick={handleContactUs}
            disabled={!message.trim()}
          >
            Send Message to Admin
          </Button>
        </div>
      </section>
      
    </LearnerLayout>
  );
};