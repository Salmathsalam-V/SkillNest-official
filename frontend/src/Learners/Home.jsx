import React, { useState } from 'react';
import { logout, sendContactMessage } from "../endpoints/axios";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import CreatorLayout from '@/components/Layouts/CreatorLayout';
import LearnerBanner from '../assets/learner-banner.jpg';
import LearnerLayout from '@/components/Layouts/LearnerLayout';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import axios from "axios";
import { useSelector } from 'react-redux';


export const Home = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const user = useSelector((state) => state.user.user);

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate('/login');
      toast.success("Logout successfully")
    }
  };
  const handleContactUs = async () => {
    if (!message.trim()) {
      toast.error("Please write a message before sending.");
      return;
    }
    try {
      console.log(user.id);
      const res = await sendContactMessage( 
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
  const communities = [
    { name: "Batch Alpha - Fabindia", desc: "Active Learning Group", messages: 3 },
    { name: "Batch Beta - Zudio", desc: "Python Enthusiasts", messages: 1 },
    { name: "Batch Gamma - Nykaa", desc: "UI/UX Designers", messages: 0 },
  ];

  const team = [
    { name: "Ravi Kumar", role: "Frontend Developer", img: "https://i.pravatar.cc/120?img=10" },
    { name: "Anita Desai", role: "Project Manager", img: "https://i.pravatar.cc/120?img=15" },
    { name: "Dr. Sanjay Mehta", role: "Head of Learning", img: "https://i.pravatar.cc/120?img=8" },
  ];

  return (
    <LearnerLayout>
      {/* Banner */}
      <div
        className="w-full bg-cover bg-center h-60 rounded-lg mb-6 flex items-center justify-center text-white shadow"
        style={{ backgroundImage: `url(${LearnerBanner})` }}
      >
        <div className="bg-black/50 p-4 rounded text-center">
          <h1 className="text-3xl font-bold">"Learn and upgrade you level "</h1>
          <p className="text-sm mt-1">— Here your skill sharperning Nest .</p>
        </div>
      </div>

      {/* Ad Section */}
      <div className="bg-[#fff3f3] border-l-4 border-pink-400 shadow p-6 mb-6 rounded">
        <h2 className="text-xl font-semibold text-gray-800">Sponsored: SkillNest x Canva Pro</h2>
        <p className="text-sm mt-1">
          Level up your designs with <strong>Canva Pro FREE for Creators</strong>. Access premium templates and share your creativity!
        </p>
      </div>

      {/* Communities */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Communities</h2>
        <div className="space-y-4">
          {communities.map((comm, index) => (
            <div key={index} className="bg-white p-4 shadow rounded flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">{comm.name}</h3>
                <p className="text-sm text-gray-600">{comm.desc}</p>
              </div>
              {comm.messages > 0 && (
                <span className="bg-gradient-to-r from-pink-400 via-teal-400 to-sky-400 text-white px-3 py-1 rounded-full text-xs">
                  {comm.messages} New Message{comm.messages > 1 ? 's' : ''}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-5">
          <button className="bg-gradient-to-r from-pink-400 via-teal-400 to-sky-400 text-white py-2 px-6 rounded-full text-sm font-semibold hover:opacity-90">
            See All
          </button>
        </div>
      </section>

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
      {/* Stats Section */}
      <section className="bg-white p-6 rounded shadow mb-8 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Our Growing Community</h2>
        <div className="flex justify-center gap-10">
          <div>
            <div className="text-2xl font-bold text-gray-700">200+</div>
            <p className="text-sm text-gray-500">Learners</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-700">75+</div>
            <p className="text-sm text-gray-500">Creators</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-700">150+</div>
            <p className="text-sm text-gray-500">Live Sessions</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-white p-6 rounded shadow text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Meet Our Team</h2>
        <div className="flex justify-center gap-6 flex-wrap">
          {team.map((member, index) => (
            <div key={index} className="text-center">
              <img
                src={member.img}
                alt={member.name}
                className="w-28 h-28 object-cover rounded-full mx-auto mb-2 shadow-md"
              />
              <p className="font-semibold text-gray-800">{member.name}</p>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-[#2a9a93] text-white text-center py-4 mt-10 rounded">
        <p>&copy; 2025 SkillNest | Empowering Creators and Learners</p>
      </footer>

      {/* Control Buttons */}
      <div className="flex gap-4 mt-6">
        <Button variant="custom" onClick={handleLogout}>Logout</Button>
        <Button variant="success" onClick={() => navigate('/')}>Menu</Button>
      </div>
    </LearnerLayout>
  );
};
