import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/Layouts/Creatorapp-sidebar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import { useSelector } from "react-redux";
import { useNotifications } from "@/components/hooks/useNotifications"
import { NotificationDropdown } from "@/components/Layouts/NotificationDropdown"
import { getNotifications } from '@/endpoints/axios';
import InviteModal from "@/components/Layouts/InviteModal";
import { Bell, UserPlus, CircleUser, Menu, X } from "lucide-react"; // Added UserPlus and Menu/X

// --- Color Palette Variables ---
const BRAND_PINK = '#EB90BA';
const BRAND_TEAL = '#6DD6B2';
const MAIN_BG = '#F8F9FA'; // Off-White background for content

const CreatorLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.user);
    const userId = user?.id;
    const [inviteModalOpen, setInviteModalOpen] = useState(false);

    const notifications = useNotifications();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            const res = await getNotifications();
            if (res && res.success) {
                setHistory(res.data);
            } else {
                console.error("Failed to load notifications:", res && res.error);
            }
        };
        fetchNotifications();
    }, []);

    // Helper to calculate unread count (assuming 'read' field exists)
    const unreadCount = notifications.filter(n => !n.read).length + history.filter(n => !n.read).length;
    
    // Normalize and combine notifications
    const normalizedHistory = history.map((n) => ({
        id: n.id,
        sender: n.sender_name || n.sender,
        notif_type: n.notif_type || n.type,
        created_at: n.created_at || n.timestamp,
        read: n.read || false,
    }));

    const normalizedLive = notifications.map((n) => ({
        id: n.id,
        sender: n.sender,
        notif_type: n.notif_type || n.type,
        created_at: n.created_at || n.timestamp,
        read: false,
    }));

    const allNotifications = [...normalizedLive, ...normalizedHistory];


    return (
        <div className="flex min-h-screen">
            {/* ---- Left sidebar ---- */}
            {isSidebarOpen && (
                <div className="fixed top-0 left-0 h-screen z-50">
                    <AppSidebar />
                </div>
            )}

            {/* ---- Right column (main content) ---- */}
            <div
                className={`flex flex-col flex-1 transition-all duration-300 ${
                    isSidebarOpen ? "ml-64" : "ml-0"
                }`} // offset for fixed sidebar
            >
                {/* Top Header / Custom Menubar */}
                <header className="sticky top-0 z-40 flex justify-between items-center bg-white border-b border-gray-100 p-4 shadow-sm h-16">
                    {/* Toggle Button (Now uses Menu/X icons) */}
                    <Button 
                        variant="ghost" 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-gray-600 hover:text-['${BRAND_PINK}']"
                        style={{ color: isSidebarOpen ? BRAND_PINK : '#343A40' }}
                    >
                        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        <span className="ml-2 hidden sm:inline">{isSidebarOpen ? "Hide Menu" : "Show Menu"}</span>
                    </Button>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        
                        {/* 1. Invite Modal Trigger (using UserPlus icon) */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setInviteModalOpen(true)}
                            className="relative text-gray-600 hover:text-['${BRAND_TEAL}']"
                            style={{ '--tw-text-opacity': 1, color: BRAND_TEAL }}
                        >
                            <UserPlus className="w-5 h-5" />
                        </Button>
                        <InviteModal open={inviteModalOpen} setOpen={setInviteModalOpen} />

                        {/* 2. Notification Dropdown (using Bell icon) */}
                        <NotificationDropdown notifications={allNotifications}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative text-gray-600 hover:text-['${BRAND_PINK}']"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span 
                                        className="absolute top-1 right-1 h-2 w-2 rounded-full ring-2 ring-white"
                                        style={{ backgroundColor: BRAND_PINK }}
                                        aria-label={`${unreadCount} unread notifications`}
                                    />
                                )}
                            </Button>
                        </NotificationDropdown>

                        {/* 3. Profiles/User Link (using CircleUser icon) */}
                        <Button
                            variant="ghost"
                            className="text-gray-600 hover:text-['${BRAND_PINK}'] flex items-center gap-2"
                            onClick={() => navigate(`/creator-profile/${userId}`)}
                        >
                            <CircleUser className="w-5 h-5" style={{ color: BRAND_PINK }} />
                            <span className="hidden sm:inline">Profile</span>
                        </Button>
                        
                        {/* 4. About Link (Optional, standard text button) */}
                        <Button
                            variant="ghost"
                            className="hidden md:flex text-gray-600 hover:text-['${BRAND_TEAL}']"
                            onClick={() => navigate('/about')} // Assuming an about route exists
                        >
                            About SkillNest
                        </Button>
                    </div>
                </header>

                {/* ---- Scrollable content area ---- */}
                <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: MAIN_BG }}>
                    {children}
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default CreatorLayout;