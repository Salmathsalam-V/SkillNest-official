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
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;

  const notifications = useNotifications();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/notifications/list/", { withCredentials: true })
      .then((res) => setHistory(res.data.results || []))
      .catch(console.error);
  }, []);
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
        <div className="fixed top-0 left-0 h-screen">
          <AppSidebar />
        </div>
      )}

      {/* ---- Right column ---- */}
      <div
        className={`flex flex-col flex-1 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`} // offset for fixed sidebar
      >
        {/* Top nav / menubar */}
        <header className="flex justify-between items-center bg-white border-b p-4 shadow-sm">
          <Button variant="outline" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          </Button>

          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>About</MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>
                <NotificationDropdown notifications={allNotifications} />
              </MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger
                onClick={() => navigate(`/creator-profile/${userId}`)}
              >
                Profiles
              </MenubarTrigger>
            </MenubarMenu>
          </Menubar>
        </header>

        {/* ---- Scrollable content area ---- */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default CreatorLayout;

