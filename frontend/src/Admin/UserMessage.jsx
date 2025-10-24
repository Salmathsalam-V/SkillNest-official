import React, { useEffect, useState } from "react";
import { getContactMessages } from "@/endpoints/axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/Layouts/AdminLayout";

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await getContactMessages();
        if (res.success) {
          console.log("Fetched messages:", res.data);
          setMessages(res.data);
          console.log("Messages set in state:", messages);
        } else {
          console.error("Failed to fetch messages:", res.error);
          toast.error("Failed to load messages");
        }
      } catch (err) {
        console.error("Error fetching contact messages:", err);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        No contact messages found.
      </div>
    );
  }

  return (
    <AdminLayout>
    <ScrollArea className="h-[calc(100vh-4rem)] p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">User Contact Messages</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {messages.map((msg) => (
          <Card key={msg.id} className="shadow-sm hover:shadow-md transition">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar>
                <AvatarImage
                  src={msg.user_profile || "/default-avatar.png"}
                  alt={msg.email}
                />
                <AvatarFallback>
                  {msg.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base font-semibold">
                  {msg.email || "Unknown User"}
                </CardTitle>
                <p className="text-xs text-gray-500">
                  {msg.username || "No Name Provided"}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(msg.created_at).toLocaleString()}
                </p>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Message:</span> {msg.content}
              </p>

              
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
    </AdminLayout>
  );
};

export default AdminContactMessages;
