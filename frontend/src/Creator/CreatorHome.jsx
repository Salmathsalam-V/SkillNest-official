import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import CreatorLayout from '@/components/Layouts/CreatorLayout';
import LearnerBanner from '../assets/creator1.png'; // Make sure this path is correct
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { sendContactMessage } from '@/endpoints/axios'; // Assuming you have this endpoint
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import axios from "axios";
import { Heart, MessageCircle } from "lucide-react";

// --- Color Palette from Suggestion ---
// Primary Brand (Pink/Purple): #EB90BA
// Accent/Highlight (Teal/Aqua): #6DD6B2
// Text Dark: #343A40
// Main Background (Off-White): #F8F9FA

const communities = [
    { id: 1, name: "Batch Alpha - Fabindia", description: "Active Learning Group", messages: 3 },
    { id: 2, name: "Batch Beta - Zudio", description: "Python Enthusiasts", messages: 1 },
    { id: 3, name: "Batch Gamma - Nykaa", description: "UI/UX Designers", messages: 0 },
];

const stats = [
    { label: "Learners", value: "12,000+", iconClass: "text-[#EB90BA]" },
    { label: "Creators", value: "2,300+", iconClass: "text-[#6DD6B2]" },
    { label: "Live Sessions", value: "150+", iconClass: "text-[#45B7D1]" },
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

    const fetchPosts = async (pageNumber) => {
        try {
            // Using pageNumber, although the current implementation doesn't use it yet
            const res = await axios.get(`http://127.0.0.1:8000/api/admin/posts/latest?page=${pageNumber}`, { withCredentials: true });
            // For simple fetching, replace the entire array. For infinite scroll, append:
            setPosts((prevPosts) => pageNumber === 1 ? res.data : [...prevPosts, ...res.data]);
        } catch (err) {
            console.error("Posts fetch error:", err);
            // toast.error("Failed to load posts.");
        }
    };

    const handleContactUs = async () => {
        if (!message.trim()) {
            toast.error("Please write a message before sending.");
            return;
        }

        try {
            // NOTE: Ensure your sendContactMessage endpoint is correctly configured
            const res = await sendContactMessage({ content: message, userId: user.id });

            if (res && res.success) { // Check for a valid response object
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
            {/* Banner - Using the suggested colors for text background */}
            <div
                className="w-full bg-cover bg-center h-64 md:h-96 rounded-xl mb-8 flex items-center justify-center text-white shadow-lg transition duration-300 hover:shadow-2xl"
                style={{ 
                    backgroundImage: `url(${LearnerBanner})`,
                    // Optional: Overlay a slight tint matching the brand
                    background: `linear-gradient(rgba(235, 144, 186, 0.2), rgba(109, 214, 178, 0.2)), url(${LearnerBanner})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <div className="bg-black/40 p-6 md:p-8 rounded-xl backdrop-blur-sm text-center border border-white/20">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        Welcome to the <span className="text-[#6DD6B2]">Creator Zone</span>
                    </h1>
                    <p className="text-base md:text-lg mt-2 font-light">Inspire. Create. Connect. — For every passionate Creator.</p>
                </div>
            </div>
            
            {/* Sponsored Ad Section - Using primary brand color for border */}
            <div className="bg-[#fcf7fa] p-6 mb-8 border-l-4 border-[#EB90BA] rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-[#343A40] mb-2">
                    Sponsored: SkillNest Partnered with <span className="text-[#EB90BA]">Canva Pro</span>
                </h2>
                <p className="text-gray-600">
                    Level up your designs with <strong>Canva Pro FREE for Creators</strong>. Access premium templates and share your creativity!
                </p>
            </div>

            {/* Latest Posts */}
            <div className="mb-10">
                <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-2xl font-bold text-[#343A40]">Latest Community Creations</CardTitle>
                </CardHeader>
                
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {posts.map((post) => (
    <Card
      key={post.id}
      className="shadow-lg rounded-xl overflow-hidden group hover:shadow-xl transition duration-300"
    >
      {/* Post author info */}
      {post.user && (
        <div className="flex items-center p-4 gap-3 border-b">
          <img
            src={post.user.profile || 'https://i.pravatar.cc/120?img=50'}
            alt={post.user.username}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#EB90BA]"
          />
          <span className="font-semibold text-[#343A40]">
            {post.user.username}
          </span>
        </div>
      )}

      {/* Post Image */}
      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="w-full h-48 object-cover group-hover:scale-[1.02] transition duration-500"
        />
      )}

      <strong className="block p-4 text-base font-medium text-[#343A40] overflow-hidden whitespace-nowrap text-ellipsis">
        {post.caption}
      </strong>

      <div className="p-4 pt-0 space-y-3">
        {/* Like & Comment Buttons */}
        <div className="flex items-center justify-between w-full border-t pt-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto flex items-center gap-1 hover:text-red-500"
            >
              {post.is_liked ? (
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              ) : (
                <Heart className="w-5 h-5 text-gray-500 hover:text-red-500" />
              )}
              <span className="text-sm text-[#6C757D]">
                {post.like_count || 0}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto flex items-center gap-1 hover:text-[#6DD6B2]"
              onClick={() => setOpenPost(post)}
            >
              <MessageCircle className="w-5 h-5 text-gray-500 hover:text-[#6DD6B2]" />
              <span className="text-sm text-[#6C757D]">
                {post.comments?.length || 0}
              </span>
            </Button>
          </div>
        </div>

        {/* First Comment Preview */}
        <div className="border-t pt-3">
          {post.comments?.length > 0 ? (
            <>
              <p className="text-sm">
                <span className="font-bold text-[#343A40]">
                  {post.comments[0].user?.username}:
                </span>{' '}
                <span className="text-gray-600">
                  {post.comments[0].content.substring(0, 40)}
                  {post.comments[0].content.length > 40 ? '...' : ''}
                </span>
              </p>
              {post.comments.length > 1 && (
                <button
                  onClick={() => setOpenPost(post)}
                  className="text-xs text-[#EB90BA] hover:underline mt-1"
                >
                  View all {post.comments.length} comments
                </button>
              )}
            </>
          ) : (
            <p className="text-xs text-gray-400">Be the first to comment!</p>
          )}
        </div>
      </div>
    </Card>
  ))}
</div>

                ) : (
                    <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-xl">
                        <p className="text-muted-foreground text-lg">No posts available right now. Check back soon!</p>
                    </div>
                )}
                
                <div className="flex justify-center mt-8">
                    <Button 
                        variant="outline" 
                        onClick={() => navigate('/community/feed')} // Assuming you have a full community feed route
                        className="border-[#EB90BA] text-[#EB90BA] hover:bg-[#EB90BA] hover:text-white transition duration-200"
                    >
                        See All Posts
                    </Button>
                </div>
            </div>

            {/* Comments modal */}
            <Dialog open={!!openPost} onOpenChange={() => setOpenPost(null)}>
                <DialogContent className="max-h-[80vh] overflow-y-auto max-w-lg rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-[#343A40]">Post Details & Comments</DialogTitle>
                    </DialogHeader>
                    {openPost && (
                        <div className="space-y-4">
                            {openPost.image && <img src={openPost.image} alt="Post" className="rounded-lg w-full mb-2" />}
                            <p className="text-gray-700 text-base">{openPost.caption}</p>
                            
                            <h4 className="text-lg font-semibold border-t pt-3 text-[#EB90BA]">Comments ({openPost.comments?.length || 0})</h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {openPost.comments?.length > 0 ? (
                                    openPost.comments.map((comment) => (
                                        <div key={comment.id} className="pb-2 flex items-start gap-2 border-b last:border-b-0">
                                            <img
                                                src={comment.user?.profile || "https://i.pravatar.cc/120?img=50"}
                                                alt={comment.user?.username}
                                                className="w-8 h-8 rounded-full object-cover mt-1"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-[#343A40]">{comment.user?.username}</p>
                                                <p className="text-sm text-gray-600">{comment.content}</p>
                                            </div>
                                            <div className="flex items-center gap-1 pt-1">
                                                {/* NOTE: Add comment like handler here */}
                                                <Heart className={`w-3 h-3 ${comment.is_liked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                                                <span className="text-xs text-gray-500">{comment.like_count || 0}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400">No comments yet. Be the first!</p>
                                )}
                            </div>
                            {/* Add a comment input field here if needed */}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* About Us Section - Improved contrast and brand colors */}
            <section className="bg-[#F8F9FA] p-10 rounded-2xl shadow-xl mb-10 border border-gray-100">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h2 className="text-4xl font-extrabold text-[#343A40]">
                        Welcome to <span className="text-[#EB90BA] bg-clip-text text-transparent bg-gradient-to-r from-[#EB90BA] to-[#6DD6B2]">SkillNest</span> ✨
                    </h2>
                    <p className="text-xl text-gray-600 font-light italic">
                        Where Creativity Finds Its Community.
                    </p>

                    {/* About SkillNest */}
                    <Card className="shadow-lg text-left border-t-4 border-[#6DD6B2] transition duration-300 hover:shadow-xl">
                        <CardHeader className="pt-6 pb-4">
                            <CardTitle className="text-2xl font-bold text-[#343A40]">
                                Your Home for Creativity and Community
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-gray-600 leading-relaxed">
                            <p>
                                At SkillNest, we believe that the most amazing creations often come from the most 
                                unexpected places—from the passionate hobbyist in a small town to the self-taught artisan. 
                                We noticed a surge of incredible talent in our own communities, people who have mastered 
                                unique skills but lacked a platform to share their gifts with the world.
                            </p>
                            <p>
                                That’s why we created SkillNest: a dedicated space for these unsung creators. Our mission 
                                is to bridge the gap between those who have knowledge to share and those eager to learn, 
                                empowering everyone to connect, create, and grow together.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Creator & Learner Highlights */}
                    <div className="grid md:grid-cols-2 gap-6 mt-8">
                        <Card className="rounded-xl shadow-md p-6 border-l-4 border-[#EB90BA] hover:shadow-lg transition">
                            <h4 className="text-xl font-semibold text-[#EB90BA] mb-3 flex items-center">
                                🌟 For Our Creators
                            </h4>
                            <ul className="space-y-2 text-[#343A40] text-left list-none pl-0">
                                <li className="flex items-start"><span className="text-[#EB90BA] mr-2 text-lg">•</span> Your Community, Your Way: Register, build your profile, and grow your own community.</li>
                                <li className="flex items-start"><span className="text-[#EB90BA] mr-2 text-lg">•</span> Teach and Inspire: Host live video/audio calls, and give personalized feedback.</li>
                                <li className="flex items-start"><span className="text-[#EB90BA] mr-2 text-lg">•</span> Showcase Your Talent: Share new creations, post announcements, and connect with your audience.</li>
                            </ul>
                        </Card>
                        <Card className="rounded-xl shadow-md p-6 border-l-4 border-[#6DD6B2] hover:shadow-lg transition">
                            <h4 className="text-xl font-semibold text-[#6DD6B2] mb-3 flex items-center">
                                📘 For Our Learners
                            </h4>
                            <ul className="space-y-2 text-[#343A40] text-left list-none pl-0">
                                <li className="flex items-start"><span className="text-[#6DD6B2] mr-2 text-lg">•</span> Discover Your Passion: Learn unique skills taught by real people.</li>
                                <li className="flex items-start"><span className="text-[#6DD6B2] mr-2 text-lg">•</span> Learn from the Masters: Join communities led by skilled creators.</li>
                                <li className="flex items-start"><span className="text-[#6DD6B2] mr-2 text-lg">•</span> Grow and Connect: Engage in a supportive, like-minded environment.</li>
                            </ul>
                        </Card>
                    </div>

                    {/* Vision Section */}
                    <div className="bg-white p-6 rounded-xl shadow mt-10 border border-dashed border-[#EB90BA]/50">
                        <h3 className="text-2xl font-bold text-[#343A40] mb-3">🌍 Our Vision</h3>
                        <p className="text-gray-700">
                            To be the global home for every creator, transforming unique talents into powerful, 
                            teachable skills that inspire and connect people worldwide.
                        </p>
                    </div>

                    {/* CTA Button */}
                    <div className="mt-8">
                        <Button 
                            className="px-10 py-3 rounded-full text-lg font-semibold shadow-xl hover:scale-[1.03] transition bg-[#EB90BA] text-white hover:bg-[#EB90BA]/90"
                            onClick={() => navigate('/register/creator')} // Example navigation
                        >
                            Join as a Creator Today
                        </Button>
                    </div>
                </div>
            </section>

            {/* Community Stats - Enhanced with color highlights */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center mb-10 border border-gray-100">
                <h2 className="text-2xl font-bold text-[#343A40] mb-6 border-b pb-3">Our Growing Community</h2>
                <div className="flex justify-around mt-4">
                    {stats.map((s, index) => (
                        <div key={index} className="space-y-1">
                            <div className={`text-4xl font-extrabold ${s.iconClass}`}>{s.value}</div>
                            <p className="text-base text-[#6C757D] font-medium">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Us Section - Using brand colors for the button */}
            <section className="bg-white p-8 rounded-xl shadow-lg mb-10 border border-gray-100">
                <h2 className="text-2xl font-bold text-[#343A40] mb-4 text-center">📩 Get in Touch</h2>
                <p className="text-sm text-gray-600 text-center mb-6">
                    Have questions, feedback, or suggestions? We’d love to hear from you!
                </p>
                
                <div className="max-w-xl mx-auto space-y-4">
                    <Textarea
                        placeholder="Write your message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)} 
                        className="min-h-[150px] resize-none focus-visible:ring-[#EB90BA]"
                    />
                    <Button 
                        className="w-full bg-[#EB90BA] text-white font-semibold shadow-md hover:bg-[#EB90BA]/90 transition duration-200"
                        onClick={handleContactUs}
                    >
                        Send Message to Admin
                    </Button>
                </div>
            </section>
            
            {/* Team Section */}
            <div className="text-center mb-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-[#343A40] mb-6 border-b pb-3">Meet Our Dedicated Team</h2>
                <div className="flex flex-wrap justify-center gap-8">
                    {team.map((member, index) => (
                        <div key={index} className="text-center p-3 transition duration-300 hover:bg-gray-50 rounded-lg">
                            <img 
                                src={member.img} 
                                alt={member.name} 
                                className="w-24 h-24 rounded-full mx-auto mb-3 object-cover shadow-md border-2 border-[#6DD6B2]" 
                            />
                            <p className="font-bold text-[#343A40]">{member.name}</p>
                            <p className="text-sm text-[#6C757D]">{member.role}</p>
                        </div>
                    ))}
                </div>
            </div>
        </CreatorLayout>
    );
};