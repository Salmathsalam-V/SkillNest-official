import React, { useState,useEffect } from 'react';
import { AppSidebar } from '@/components/Layouts/Creatorapp-sidebar';
import { Button } from '@/components/ui/button';
import axios from "axios";
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
 import { useNotifications } from "@/components/hooks/useNotifications"
 import { NotificationDropdown } from "@/components/Layouts/NotificationDropdown"

const CreatorLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate=useNavigate()
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;
  const notifications = useNotifications(); // live
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/notifications/list/", { withCredentials: true })   
      .then((res) => setHistory(res.data))
      .catch((err) => console.error(err));
  }, []);
  const allNotifications = [...notifications, ...history];
  console.log("Notifications in Layout:", [...notifications, ...history]);
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
                  <MenubarTrigger>      <NotificationDropdown notifications={allNotifications} />
                  </MenubarTrigger>
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
