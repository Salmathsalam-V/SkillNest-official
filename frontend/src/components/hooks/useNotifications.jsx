//src/hooks/useNotifications.js
import { useEffect, useState } from "react";
import { toast } from 'sonner';


export const useNotifications=()=> {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsHost = "api.skillnestco.xyz";
    const ws = new WebSocket(`${wsProtocol}://${wsHost}/ws/notifications/`);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const normalized = {
        id: data.id,
        sender: data.sender,
        notif_type: data.type,     // <-- FIX
        post_id: data.post_id,     // <-- OK
        created_at: data.timestamp // <-- FIX
      };
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
  return notifications;
}
