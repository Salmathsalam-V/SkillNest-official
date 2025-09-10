import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fetchMessages, sendMessage, fetchChatRoom } from "../endpoints/axios";
import CreatorLayout from "@/components/Layouts/CreatorLayout";
import { toast } from 'sonner';


export const CommunityPage = () => {
  const { communityId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [community, setCommunity] = useState(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;

  // ✅ Load Chat Room
  const loadChatRoom = async () => {
    try {
      const { data } = await fetchChatRoom(communityId);
      setCommunity(data);
    } catch (error) {
      console.error("ChatRoom Error:", error);
    }
  };

  // ✅ Load Messages
  const loadMessages = async () => {
    try {
      const { data } = await fetchMessages(communityId);
      setMessages(data.results.reverse());
    } catch (error) {
      console.error("Messages Error:", error);
    }
  };

const handleSend = async (mediaUrl = null) => {
  if (!newMessage.trim() && !mediaUrl) return; // prevent empty send

  try {
    const { data } = await sendMessage(communityId, {
    content: newMessage,
    media_url: null,
    message_type: "text",
  });

    setMessages([...messages, data]);
    setNewMessage("");
  } catch (error) {
    console.error("Send Error:", error);
  }
};

  // ✅ Upload & Send Media (image/video/file)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    // 👇 Cloudinary upload preset & account
    formData.append("upload_preset", "skillnest_profile");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dg8kseeqo/upload", // auto-detects type
        formData
      );
      const url = res.data.secure_url;

      // Detect file type
      let messageType = "file";
      if (file.type.startsWith("image/")) messageType = "image";
      else if (file.type.startsWith("video/")) messageType = "video";

      // Send media message
      const { data } = await sendMessage(communityId, {
        content: "",              // empty since it’s media
        media_url: url,           // ✅ correct field
        message_type: messageType,
      });


      setMessages([...messages, data]);
      toast.success("Media uploaded");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Scroll to bottom when new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadChatRoom();
    loadMessages();
  }, [communityId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!community) return <p>Loading community...</p>;

  return (   
    <CreatorLayout>
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Card className="rounded-none shadow-md">
        <CardContent className="flex items-center space-x-3 p-4">
          <Avatar>
            <AvatarImage 
            src={community.community?.creator?.profile || community.created_by?.profile || ""} 
            alt={community.community?.creator?.username || community.created_by?.username || ""} 
            />
            <AvatarFallback>
              {(community.community?.creator?.username || community.created_by?.username || "?")[0]}
            </AvatarFallback>
          </Avatar>          
          <div>
            <h2 className="text-lg font-semibold">{community.name}</h2>
            <p className="text-sm text-gray-500">  by {community.community?.creator?.username || community.created_by?.username}
            </p>
          </div>

        </CardContent>
      </Card>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => {
            const isMine = msg?.sender?.id === userId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isMine ? "items-end" : "items-start"
                }`}
              >
                <span className="text-xs text-gray-500 mb-1">
                  {isMine ? "You" : msg?.sender?.username || "Unknown"}
                </span>

                <div
  className={`max-w-xs px-4 py-2 rounded-2xl shadow ${
    isMine
      ? "bg-blue-600 text-white rounded-br-none"
      : "bg-gray-200 text-gray-900 rounded-bl-none"
  }`}
>
  {msg.content && <p>{msg.content}</p>}
 {msg.media_url && (
  <>
    {msg.message_type === "video" ? (
      <video src={msg.media_url} controls className="mt-2 rounded-md max-w-full" />
    ) : (
      <img src={msg.media_url} alt="uploaded" className="mt-2 rounded-md max-w-full" />
    )}
  </>
)}

</div>

                
              </div>
            );
          })}
          <div ref={messagesEndRef}></div>
        </div>

      {/* Input area */}
      <div className="p-4 border-t bg-white flex items-center space-x-2">
      <Input
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
     <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            id="chat-upload"
            onChange={handleFileUpload}
          />
          <label
  htmlFor="chat-upload"
  className={`cursor-pointer px-3 py-2 rounded-xl ${
    uploading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
  }`}
>
  {uploading ? "⏳ Uploading..." : "📎"}
</label>




      <Button onClick={() => handleSend()}>Send</Button>
    </div>

    </div>
    </CreatorLayout>   
  );
};
