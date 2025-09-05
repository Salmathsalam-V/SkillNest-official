import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const ChatPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: "creator", text: "Hey! Welcome to the community chat 👋" },
    { id: 2, sender: "user", text: "Hi, excited to be here!" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: "user", text: newMessage }]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Card className="rounded-none shadow-md">
        <CardContent className="flex items-center space-x-3 p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/creator.jpg" alt="creator" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">Community Name</h2>
            <p className="text-sm text-gray-500">by Creator Name</p>
          </div>
        </CardContent>
      </Card>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl shadow ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-900 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
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
