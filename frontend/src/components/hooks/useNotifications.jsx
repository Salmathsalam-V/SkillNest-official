
 //src/hooks/useNotifications.js
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";


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
      setNotifications((prev) => [data, ...prev]);
      toast(`${data.sender} ${data.notif_type} your post`, {
        icon: "🔔",})
      // optional toast
      toast(`${data.sender} ${data.type} your post`);
    };

    return () => ws.close();
  }, []);

  return notifications;
}
