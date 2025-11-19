import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    UserCog,
    MessageSquareText,
    PencilLine,
    LogOut,
    MessageCircle, // Changed one MessageSquareText to MessageCircle for variety
    CreditCard,    // Payments Icon
    ShieldAlert    // Reported Posts Icon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/endpoints/axios";
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';


export const AppSidebar = () => {
    const navigate = useNavigate();
    // const user = useSelector((state) => state.user.user); // User is not used in the render function
    const location = useLocation(); // Used to determine the active link

    const handleLogout = async () => {
        // ... (handleLogout logic remains the same)
        const success = await logout();
        if (success) {
            navigate('/')
        }
    }

    // Helper function to check if the current path matches the link
    const isActive = (path) => location.pathname === path;

    // Define menu items for cleaner mapping
    const menuItems = [
        { name: "Dashboard", path: "/adminhome", icon: LayoutDashboard },
        { name: "Learners", path: "/listlearner", icon: Users },
        { name: "Creators", path: "/listcreator", icon: UserCog },
        { name: "Posts", path: "/posts-admin", icon: PencilLine },
        { name: "Contact Messages", path: "/messages", icon: MessageCircle },
        { name: "Reported Posts", path: "/reports", icon: ShieldAlert },
        { name: "Communities", path: "/admin/communities", icon: PencilLine },
        { name: "Payments", path: "/admin-payments", icon: CreditCard },
    ];

    return (
        <aside className="fixed top-0 left-0 h-screen w-64 bg-white/95 backdrop-blur-sm p-6 shadow-2xl shadow-gray-200 overflow-y-auto z-50 transition-all duration-300">
            {/* Logo and Heading */}
            <div className="flex items-center gap-2 mb-10 border-b pb-4 border-gray-100">
                <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
                <span className="text-3xl font-extrabold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1] bg-clip-text text-transparent">
                    SkillNest
                </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-y-2 font-medium">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <Link key={item.path} to={item.path}>
                            <Button
                                variant="ghost"
                                className={`
                                    w-full justify-start gap-3 text-gray-700 h-11 rounded-lg transition-all duration-200
                                    ${active
                                        ? 'bg-purple-100 text-purple-700 font-bold shadow-sm'
                                        : 'hover:bg-purple-50 hover:text-purple-600'
                                    }
                                `}
                            >
                                <Icon className="h-5 w-5" />
                                {item.name}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button (Sticky to Bottom) */}
            <div className="mt-10 pt-4 border-t border-gray-100">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-600 h-11 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </Button>
            </div>
        </aside>
    );
};