import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    MessageSquareText,
    LogOut,
    UserCog,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/endpoints/axios";
import { useSelector } from 'react-redux';

// --- Color Palette Variables ---
const LEARNER_ACCENT = '#6DD6B2'; // Primary accent for Learners
const SECONDARY_ACCENT = '#EB90BA'; // Used for gradient/logo
const TEXT_DARK = '#343A40';
const TEXT_MEDIUM = '#6C757D';

export const AppSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Hook to get the current URL path
    const user = useSelector((state) => state.user.user); // Used for profile info

    const handleLogout = async () => {
        const success = await logout();
        if (success) {
            navigate('/login');
        }
    };

    // Define Navigation Items (Data kept exactly the same as requested)
    const navItems = [
        { to: "/learnerhome", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/creators-list", icon: UserCog, label: "Creators" },
        { to: "/learners-list", icon: Users, label: "Learners" },
        { to: "/posts", icon: BookOpen, label: "Posts" },
        { to: "/learner/communities", icon: MessageSquareText, label: "Community" },
    ];

    // Function to determine if a link is active
    const isActive = (path) => location.pathname === path;

    return (
        // Sidebar container: Pure white background, subtle shadow
        <aside className="fixed top-0 left-0 h-screen w-64 bg-white p-6 shadow-xl overflow-y-auto border-r border-gray-100 transition-all duration-300">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 mb-10 pb-4 border-b border-gray-100">
                {/* Custom Logo/Icon placeholder using Learner Accent */}
                <div 
                    className="h-10 w-10 flex items-center justify-center rounded-full text-white font-bold text-lg" 
                    style={{ background: LEARNER_ACCENT }} // Solid Teal for Learner ID
                >
                    SN
                </div>
                {/* SkillNest Name Gradient (uses both colors) */}
                <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent"
                    style={{ 
                        backgroundImage: `linear-gradient(to right, ${LEARNER_ACCENT}, ${SECONDARY_ACCENT})`
                    }}
                >
                    SkillNest
                </span>
            </div>

            {/* User Profile Info (If user object has data) */}
            {user?.username && (
                 <div className="flex items-center gap-3 mb-6 p-2 rounded-lg bg-gray-50 border border-gray-200">
                     <img 
                        src={user.profile_pic || "https://i.pravatar.cc/120?img=50"}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover border-2"
                        style={{ borderColor: LEARNER_ACCENT }} // Learner accent border
                     />
                     <div>
                         <p className="text-sm font-semibold text-['${TEXT_DARK}']">{user.username}</p>
                         <p className="text-xs text-['${TEXT_MEDIUM}']">Learner Account</p>
                     </div>
                 </div>
            )}

            {/* Navigation Items */}
            <nav className="flex flex-col gap-y-2 font-medium">
                {navItems.map((item) => {
                    const active = isActive(item.to);
                    return (
                        <Link key={item.to} to={item.to}>
                            <Button
                                variant="ghost"
                                className={`w-full justify-start gap-3 py-6 rounded-xl transition-all duration-200 
                                    ${active
                                        ? `text-white shadow-md hover:text-white`
                                        : `text-['${TEXT_MEDIUM}'] hover:bg-gray-100 hover:text-['${TEXT_DARK}']`
                                    }`}
                                // Apply dynamic colors based on active state
                                style={active 
                                    ? { backgroundColor: LEARNER_ACCENT } 
                                    : {}
                                }
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}

                {/* Separator */}
                <div className="h-px bg-gray-200 my-4" />

                {/* Logout Button */}
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl py-6 transition-all duration-200"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </Button>
            </nav>
        </aside>
    );
};