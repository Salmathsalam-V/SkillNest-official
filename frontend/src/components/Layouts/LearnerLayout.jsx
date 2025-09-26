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

const LearnerLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

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
              <MenubarTrigger>Notification</MenubarTrigger>
            </MenubarMenu>
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
