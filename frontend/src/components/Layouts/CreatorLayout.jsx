import React, { useState } from 'react';
import { AppSidebar } from '@/components/Layouts/Creatorapp-sidebar';
import { Button } from '@/components/ui/button';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import { useSelector } from "react-redux";

const CreatorLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate=useNavigate()
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      {isSidebarOpen && <AppSidebar />}

      {/* Main Content */}
      <div className="flex-1 p-4">
        {/* Trigger to toggle sidebar */}
        <div className="flex justify-between items-center mb-4">
            {/* Sidebar Toggle Button on the left */}
            <Button variant="outline" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                {isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
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
                  <MenubarTrigger onClick={() => navigate(`/creator-profile/${userId}`)}>Profiles</MenubarTrigger>
                </MenubarMenu>
            </Menubar>
        </div>


            <main className="mt-4">
            {children}
            </main>
                  <Footer/>

      </div>
    </div>
  );
};

export default CreatorLayout;
