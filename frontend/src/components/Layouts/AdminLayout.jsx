import React, { useState } from 'react';
import { AppSidebar } from '@/components/Layouts/Adminapp-sidebar';
import { Button } from '@/components/ui/button';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"
import Footer from './Footer';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ---- Left sidebar ---- */}
      {isSidebarOpen && (
        <div className="fixed top-0 left-0 h-screen">
          <AppSidebar />
        </div>
      )}

      {/* ---- Right column ---- */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`} // offset for fixed sidebar
      >
        {/* Top nav / menubar */}
        <header className="flex justify-between items-center bg-white border-b p-4 shadow-sm">
          <Button
            variant="outline"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          </Button>

          {/* Menubar aligned to the right */}
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>About</MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Notification</MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Profiles</MenubarTrigger>
            </MenubarMenu>
          </Menubar>
        </header>

        {/* ---- Scrollable content area ---- */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;
