import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  MessageSquareText,
  PencilLine,
  LogOut,
  UserCog,
  Users,

} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/endpoints/axios";
import { useSelector } from 'react-redux';

export const AppSidebar = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate('/login');
    }
  };

  return (
    <aside className="w-64 bg-[#f3f4f6] p-6 shadow-md">
      {/* Logo and Title */}
      <div className="flex items-center gap-2 mb-8">
        <img src="/logo.png" alt="Logo" className="h-12 w-12 object-contain" />
        <span className="text-3xl font-extrabold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1] bg-clip-text text-transparent">
          SkillNest
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-y-2 font-poppins font-medium">
        <Link to="/learnerhome">
          <Button variant="outline" className="w-full justify-start gap-2">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Button>
        </Link>
        <Link to="/creators-list">
          <Button variant="outline" className="w-full justify-start gap-2">
          <UserCog className="h-5 w-5" />
            Creators
          </Button>
        </Link>
        <Link to="/learners-list">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="h-5 w-5" />
                  Learners
                </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" className="w-full justify-start gap-2">
            <BookOpen className="h-5 w-5" />
            Pages
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" className="w-full justify-start gap-2">
            <FileText className="h-5 w-5" />
            Posts
          </Button>
        </Link>
        <Link to="/learner/communities">
          <Button variant="outline" className="w-full justify-start gap-2">
            <MessageSquareText className="h-5 w-5" />
            Community
          </Button>
        </Link>
        <Link to="">
          <Button variant="outline" className="w-full justify-start gap-2">
            <PencilLine className="h-5 w-5" />
            Feedback
          </Button>
        </Link>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </nav>
    </aside>
  );
};
