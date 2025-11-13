import React, { useState } from 'react';
import { AppSidebar } from '@/components/Layouts/Learnerapp-sidebar';
import { Button } from '@/components/ui/button';
import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
} from "@/components/ui/menubar"
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import { Bell, UserPlus, CircleUser, Menu, X, Globe } from "lucide-react"; // Added Globe for About
// Assuming a NotificationDropdown exists for future integration
// import { NotificationDropdown } from "@/components/Layouts/NotificationDropdown" 
import InviteModal from "@/components/Layouts/InviteModal";

// --- Color Palette Variables ---
// Primary Learner Accent (Aqua/Teal): #6DD6B2 (was secondary in Creator layout)
const LEARNER_ACCENT = '#6DD6B2';
// Secondary Accent (Pink/Purple): #EB90BA (was primary in Creator layout, now used sparingly)
const SECONDARY_ACCENT = '#EB90BA';
const TEXT_DARK = '#343A40';
const MAIN_BG = '#F8F9FA'; // Off-White background for content

const LearnerLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const [inviteModalOpen, setInviteModalOpen] = useState(false);

    // NOTE: In a real app, you would integrate notifications here like in CreatorLayout.
    const unreadCount = 0; // Placeholder for now

    return (
        <div className="flex min-h-screen">
            {/* ---- Left sidebar ---- */}
            {isSidebarOpen && (
                <div className="fixed top-0 left-0 h-screen z-50">
                    {/* Ensure your AppSidebar (Learnerapp-sidebar) uses LEARNER_ACCENT for active state */}
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
                    
                    {/* Toggle Button */}
                    <Button 
                        variant="ghost" 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-gray-600 hover:text-['${LEARNER_ACCENT}']"
                        style={{ color: isSidebarOpen ? LEARNER_ACCENT : TEXT_DARK }}
                    >
                        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        <span className="ml-2 hidden sm:inline">{isSidebarOpen ? "Hide Menu" : "Show Menu"}</span>
                    </Button>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        
                        {/* 1. About Link (Uses Globe icon for site context) */}
                        <Button
                            variant="ghost"
                            className="hidden md:flex text-gray-600 hover:text-['${LEARNER_ACCENT}']"
                            onClick={() => navigate('/about')} 
                        >
                             <Globe className="w-5 h-5 mr-1" style={{ color: LEARNER_ACCENT }} />
                            About SkillNest
                        </Button>
                        
                        {/* 2. Invite Modal Trigger (using UserPlus icon) */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setInviteModalOpen(true)}
                            className="relative text-gray-600 hover:text-['${SECONDARY_ACCENT}']"
                            style={{ color: SECONDARY_ACCENT }}
                        >
                            <UserPlus className="w-5 h-5" />
                        </Button>
                        <InviteModal open={inviteModalOpen} setOpen={setInviteModalOpen} />

                        {/* 3. Notification Dropdown Trigger (using Bell icon) */}
                        {/* NOTE: If you integrate a NotificationDropdown, replace the button below with the dropdown trigger */}
                        {/* <Button
                            variant="ghost"
                            size="icon"
                            className="relative text-gray-600 hover:text-['${LEARNER_ACCENT}']"
                            // onClick={() => openNotifications()} // Example handler
                        >
                            <Bell className="w-5 h-5" style={{ color: LEARNER_ACCENT }} />
                            {unreadCount > 0 && (
                                <span 
                                    className="absolute top-1 right-1 h-2 w-2 rounded-full ring-2 ring-white"
                                    style={{ backgroundColor: LEARNER_ACCENT }}
                                    aria-label={`${unreadCount} unread notifications`}
                                />
                            )}
                        </Button> */}

                        {/* 4. Profiles/User Link (using CircleUser icon) */}
                        <Button
                            variant="ghost"
                            className="text-gray-600 hover:text-['${LEARNER_ACCENT}'] flex items-center gap-2"
                            onClick={() => navigate('/profile')}
                        >
                            <CircleUser className="w-5 h-5" style={{ color: LEARNER_ACCENT }} />
                            <span className="hidden sm:inline">Profile</span>
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

export default LearnerLayout;