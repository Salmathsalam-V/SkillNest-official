import React, { useEffect, useState, useRef  } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fetchMessages, sendMessage, fetchChatRoom } from "../endpoints/axios";

export const CommunityPage = () => {
  const { communityId } = useParams(); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [community, setCommunity] = useState(null);
  const messagesEndRef = useRef(null);
  console.log("before",communityId);
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;
  const loadChatRoom = async () => {
  try {
    console.log(communityId);
    console.log("Loading chat room for community ID:", communityId);
    const { data } = await fetchChatRoom(communityId);
    console.log("ChatRoom Data:", data);
    setCommunity(data);
  } catch (error) {
    console.error("ChatRoom Error:", error);
  }
};

const loadMessages = async () => {
  try {
    console.log("Loading messages for community ID:", communityId);
    const { data } = await fetchMessages(communityId);
    console.log("Messages Data:", data);
    setMessages(data.results.reverse());
  } catch (error) {
    console.error("Messages Error:", error);
  }
};


  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      const { data } = await sendMessage(communityId, newMessage);
      setMessages([...messages, data]);
      setNewMessage("");
    } catch (error) {
      console.error(error);
    }
  };

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
      <div key={msg.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
        {/* ✅ Username */}
        <span className="text-xs text-gray-500 mb-1">
          {isMine ? "You" : msg?.sender?.username || "Unknown"}
        </span>

        {/* ✅ Message bubble */}
        <div
          className={`max-w-xs px-4 py-2 rounded-2xl shadow ${
            isMine
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-gray-200 text-gray-900 rounded-bl-none"
          }`}
        >
          {msg.content}
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
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
};

