//src/hooks/useNotifications.js
import { useEffect, useState } from "react";
import { toast } from 'sonner';


export const useNotifications=()=> {
  const [notifications, setNotifications] = useState([]);
  console.log("Setting up WebSocket connection for notifications");
  useEffect(() => {
    // // with cookie-based JWT, no token needed
    // const token = getCookie("access_token");
    // console.log("Retrieved token from cookies:", token);
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${wsProtocol}://127.0.0.1:8000/ws/notifications/`);

    console.log("WebSocket instance created from hooks, useNotification:", ws);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const normalized = {
        id: data.id,
        sender: data.sender,
        notif_type: data.type,     // <-- FIX
        post_id: data.post_id,     // <-- OK
        created_at: data.timestamp // <-- FIX
      };
      console.log("Received notification via WebSocket:", normalized);
      setNotifications((prev) => [normalized, ...prev]);
      if (!data.type || data.type === "connection_established") return;
      if (data.type === 'follow') {
        toast.info(`${data.sender} ${data.type} you`, {
        icon: "🔔",})
      } else{
      toast.info(`${data.sender} ${data.type} your post`, {
        icon: "🔔",})
      };
    };
    return () => ws.close();
  }, []);
  console.log("Updated notifications state:", notifications);
  return notifications;
}
