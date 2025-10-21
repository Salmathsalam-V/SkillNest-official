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
import { Bell } from "lucide-react";
import InviteModal from "@/components/Layouts/InviteModal";

const LearnerLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed top-0 left-0 h-screen">
          <AppSidebar />
        </div>
      )}

      {/* Main content */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`} // offset for fixed sidebar
      >
        {/* Header / Menubar */}
        <header className="flex justify-between items-center bg-white border-b p-4 shadow-sm">
          <Button variant="outline" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          </Button>

          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>About</MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger onClick={() => setInviteModalOpen(true)}>
                <Bell className="w-5 h-5 cursor-pointer" />
              </MenubarTrigger>
            </MenubarMenu>
            <InviteModal open={inviteModalOpen} setOpen={setInviteModalOpen} />
            <MenubarMenu>
              <MenubarTrigger onClick={() => navigate('/profile')}>
                Profiles
              </MenubarTrigger>
            </MenubarMenu>
          </Menubar>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default LearnerLayout;
