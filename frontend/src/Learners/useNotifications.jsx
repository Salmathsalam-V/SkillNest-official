import { useEffect, useState } from "react";

export function useNotifications(token) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setNotifications(prev => [data, ...prev]);
      // Optionally show toaster
      alert(`${data.sender} ${data.type} your post`);
    };

    return () => ws.close();
  }, [token]);

  return notifications;
}
