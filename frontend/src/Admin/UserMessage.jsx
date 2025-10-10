import React, { useEffect, useState } from "react";
import { getContactMessages } from "@/endpoints/axios";
import { toast } from "sonner";

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await getContactMessages();
      if (res.success) {
        console.log("Fetched messages:", res.data);
        setMessages(res.data);
      } else {
        console.error("Failed to fetch messages:", res.error);
        toast.error("Failed to load messages");
      }
    };
    fetchMessages();
  }, []);

  return (
    <div>
      {/* render messages here */}
    </div>
  );
};

export default AdminContactMessages;
