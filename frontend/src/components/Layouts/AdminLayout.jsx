import React, { useState } from 'react';
import { AppSidebar } from '@/components/Layouts/Adminapp-sidebar';
import { Button } from '@/components/ui/button';
import { Menu, X, Bell, User } from 'lucide-react'; // Import icons for better visuals
// Menubar components are simplified or removed for a cleaner header
import Footer from './Footer';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ---- Left Sidebar ---- */}
      {isSidebarOpen && (
        <div className="fixed top-0 left-0 h-screen z-50">
          {/* Note: AppSidebar already has shadow and styling */}
          <AppSidebar />
        </div>
      )}

      {/* ---- Right Content Column ---- */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        } relative`} // Added relative for sticky header/footer positioning
      >
        {/* Top Header / Navbar */}
        <header className="sticky top-0 z-40 flex justify-between items-center h-16 bg-white border-b border-gray-100 px-6 shadow-md">
          
          {/* Sidebar Toggle Button */}
          <Button
            variant="ghost" // Use ghost for a non-intrusive look
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-600 hover:bg-gray-100 hover:text-purple-600 transition-colors"
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" /> // Close/X icon when sidebar is visible
            ) : (
              <Menu className="h-6 w-6" /> // Hamburger icon when sidebar is hidden
            )}
          </Button>

          {/* Right Side - Actions/Profile (Menubar replacement) */}
          <div className="flex items-center gap-4">
            
            {/* Notifications
            <Button variant="ghost" size="icon" className="relative text-gray-600 hover:bg-gray-100 hover:text-blue-500 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
            </Button> */}

            {/* Profile Placeholder/Trigger */}
            <div className="flex items-center gap-2 cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors">
                 <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                    SK
                 </div>
                 <span className="text-sm font-medium text-gray-700 hidden sm:inline">Admin User</span>
                 <User className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </header>

        {/* ---- Scrollable Content Area (Main) ---- */}
        <main className="flex-1 overflow-y-auto p-8"> 
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;