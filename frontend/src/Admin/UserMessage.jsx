import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; 
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import AdminLayout from "@/components/Layouts/AdminLayout";

const MessagesTable = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/admin/contact-us/", { withCredentials: true });
        console.log("Fetched messages:", res.data);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        toast.error("Failed to load messages");
      }
    };
    fetchMessages();
  }, []);

  return (
    <AdminLayout>
        <Card className="p-6 shadow mt-6">
        <h2 className="text-xl font-bold mb-4">📩 Contact Messages</h2>
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message</TableHead>
                {/* <TableHead>Reply</TableHead> */}
                <TableHead>Date</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {messages.length > 0 ? (
                messages.map((msg) => (
                <TableRow key={msg.id}>
                    <TableCell>{msg.username}</TableCell>
                    <TableCell>{msg.email}</TableCell>
                    <TableCell>{msg.content}</TableCell>
                    {/* <TableCell>{msg.replay || "—"}</TableCell> */}
                    <TableCell>{new Date(msg.created_at).toLocaleString()}</TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                    No messages yet.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </Card>
    </AdminLayout>
  );
};

export default MessagesTable;
