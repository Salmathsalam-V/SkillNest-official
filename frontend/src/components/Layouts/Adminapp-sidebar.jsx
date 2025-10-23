import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  MessageSquareText,
  PencilLine,
  LogOut 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/endpoints/axios";
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';


export const AppSidebar = () => {

    const navigate = useNavigate();
    const user = useSelector((state) => state.user.user);



    const handleLogout = async ()=>{
        const success = await logout();
        if (success){
            navigate('/login')
        }
    }
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#f3f4f6] p-6 shadow-md overflow-y-auto">
<div className="flex items-center gap-2 mb-8">
  <img src="/logo.png" alt="Logo" className="h-13 w-12 object-contain" />
  <span className="text-3xl font-extrabold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1] bg-clip-text text-transparent">
    SkillNest
  </span>
</div>



<nav className="flex flex-col gap-y-2 font-poppins font-medium">
      <Link to="/adminhome">
        <Button variant="outline" className="w-full justify-start gap-2">
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Button>
      </Link>
      <Link to="/listlearner">
        <Button variant="outline" className="w-full justify-start gap-2">
          <Users className="h-5 w-5" />
          Learners
        </Button>
      </Link>
      <Link to="/listcreator">
        <Button variant="outline" className="w-full justify-start gap-2">
          <UserCog className="h-5 w-5" />
          Creators
        </Button>
      </Link>
      <Link to="/posts-admin">
        <Button variant="outline" className="w-full justify-start gap-2">
          <MessageSquareText className="h-5 w-5" />
          Posts
        </Button>
      </Link>
      <Link to="/messages">
        <Button variant="outline" className="w-full justify-start gap-2">
          <MessageSquareText className="h-5 w-5" />
          Chat
        </Button>
      </Link>
      <Link to="/reports">
        <Button variant="outline" className="w-full justify-start gap-2">
          <MessageSquareText className="h-5 w-5" />
          Reported Posts
        </Button>
      </Link>
      <Link to="/admin/communities">
        <Button variant="outline" className="w-full justify-start gap-2">
          <PencilLine className="h-5 w-5" />
          Community
        </Button>
      </Link>
      <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
          Logout
      </Button>
    </nav>
    </aside>
  );
};
