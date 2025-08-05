import React from 'react';
import { logout } from "../endpoints/axios";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CreatorLayout from '@/components/Layouts/CreatorLayout';
import LearnerBanner from '../assets/learner-banner.jpg';

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

  const handleLogout = async () => {
    const success = await logout();
    if (success) navigate('/login');
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

      {/* Buttons */}
      <div className="flex gap-4 mb-6">
        <Button variant="custom" onClick={handleLogout}>Logout</Button>
        <Button variant="success" onClick={() => navigate('/')}>Menu</Button>
      </div>

      {/* Sponsored Ad Section */}
      <div className="bg-[#fff3f3] p-6 mb-6 border-l-4 border-[#f2709c] shadow">
        <h2 className="text-xl font-semibold mb-2">Sponsored: SkillNest Partnered with Canva Pro</h2>
        <p>Level up your designs with <strong>Canva Pro FREE for Creators</strong>. Access premium templates and share your creativity!</p>
      </div>

      {/* Communities */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Your Communities</h2>
        <div className="space-y-4">
          {communities.map((c) => (
            <div key={c.id} className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold">{c.name}</h3>
                <p className="text-sm text-gray-600">{c.description}</p>
              </div>
              {c.messages > 0 && (
                <span className="bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1] text-white px-3 py-1 rounded-full text-sm font-medium">
                  {c.messages} New Message{c.messages > 1 ? "s" : ""}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <Button variant="outline">See All</Button>
        </div>
      </div>

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
