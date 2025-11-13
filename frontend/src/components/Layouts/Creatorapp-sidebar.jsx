import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    PencilLine,
    LogOut,
    UserCog,
    Users,
    BookOpen,
    Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/endpoints/axios";
import { useSelector } from 'react-redux';

// --- Color Palette Variables (Using Tailwind arbitrary values for consistency) ---
const BRAND_PINK = '#EB90BA';

const BRAND_TEAL = '#6DD6B2';
const TEXT_DARK = '#343A40';
const TEXT_MEDIUM = '#6C757D';

export const AppSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Hook to get the current URL path
    const creator = useSelector((state) => state.user.user);

    const handleLogout = async () => {
        const success = await logout();
        if (success) {
            navigate('/login');
        }
    };

    // Define Navigation Items
    const navItems = [
        { to: "/creatorhome", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/learners-list", icon: Users, label: "Learners" },
        { to: "/creators-list", icon: UserCog, label: "Creators" },
        { to: "/", icon: BookOpen, label: "Posts" },
        { to: `/creator/communities`, icon: PencilLine, label: "Communities" },
    ];

    // Function to determine if a link is active
    const isActive = (path) => location.pathname === path;

    return (
        // Sidebar container: Pure white background, subtle shadow, matches CreatorHome padding/style
        <aside className="fixed top-0 left-0 h-screen w-64 bg-white p-6 shadow-xl overflow-y-auto border-r border-gray-100 transition-all duration-300">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 mb-10 pb-4 border-b border-gray-100">
                {/* Placeholder for a logo image or elegant icon */}
                <div 
                    className="h-10 w-10 flex items-center justify-center rounded-full text-white font-bold text-lg" 
                    style={{ background: `linear-gradient(45deg, ${BRAND_PINK}, ${BRAND_TEAL})` }}
                >
                    SN
                </div>
                <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent"
                    style={{ 
                        backgroundImage: `linear-gradient(to right, ${BRAND_PINK}, ${BRAND_TEAL})`
                    }}
                >
                    SkillNest
                </span>
            </div>

            {/* User Profile Info (Optional but helpful) */}
            {creator && (
              <div className="flex items-center gap-3 mb-6 p-2 rounded-lg bg-gray-50 border border-gray-200">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                  {creator.username ? creator.username.charAt(0).toUpperCase() : "S"}
                </div>

                {/* Creator Info */}
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {creator.username || "Creator"}
                  </p>
                  <p className="text-xs text-gray-500">Creator Account</p>
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
                                        ? `bg-['${BRAND_PINK}'] text-white shadow-md hover:bg-['${BRAND_PINK}'] hover:text-white`
                                        : `text-['${TEXT_MEDIUM}'] hover:bg-gray-100 hover:text-['${TEXT_DARK}']`
                                    }`}
                                style={active ? { backgroundColor: BRAND_PINK } : {}}
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