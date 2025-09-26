import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UsersRound,
  FileText,
  MessageSquareText,
  PencilLine,
  LogOut,
  UserCog,
  Users,
  BookOpen

} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/endpoints/axios";
import { useSelector } from 'react-redux';
import { useState } from 'react';
import axios from "axios";
import { useEffect } from 'react';
 import { useNotifications } from "@/components/hooks/useNotifications"
 export const AppSidebar = () => {

  const notifications = useNotifications(); // live

  const navigate = useNavigate();

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigate('/login');
    }
  };
  const creator=useSelector((state) => state.user.user)
  console.log(creator)


  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#f3f4f6] p-6 shadow-md overflow-y-auto">
      {/* Logo and Title */}
      <div className="flex items-center gap-2 mb-8">
        <img src="/logo.png" alt="Logo" className="h-12 w-12 object-contain" />
        <span className="text-3xl font-extrabold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1] bg-clip-text text-transparent">
          SkillNest
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-y-2 font-poppins font-medium">
        <Link to="/creatorhome">
          <Button variant="outline" className="w-full justify-start gap-2">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Button>
        </Link>
        <Link to="/learners-list">
        <Button variant="outline" className="w-full justify-start gap-2">
          <Users className="h-5 w-5" />
          Learners
        </Button>
      </Link>
        <Link to="/creators-list">
          <Button variant="outline" className="w-full justify-start gap-2">
          <UserCog className="h-5 w-5" />
            Creators
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" className="w-full justify-start gap-2">
            <BookOpen className="h-5 w-5" />
            Pages
          </Button>
        </Link>
        <Link to="">
          <Button variant="outline" className="w-full justify-start gap-2">
            <MessageSquareText className="h-5 w-5" />
            Chat
          </Button>
        </Link>
        <Link to={`/creator/communities`}>
          <Button variant="outline" className="w-full justify-start gap-2">
            <PencilLine className="h-5 w-5" />
            Communities
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
