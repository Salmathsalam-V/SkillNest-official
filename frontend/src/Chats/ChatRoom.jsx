// src/components/Chat/ChatRoom.jsx

import React, { useState, useRef, useEffect } from "react";
import useChat from "../../hooks/useChat";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import OnlineUsers from "./OnlineUsers";
import ConnectionStatus from "./ConnectionStatus";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle } from "@/components/ui/alert";

const ChatRoom = ({ roomSlug, currentUser }) => {
  const {
    messages,
    onlineUsers,
    typingUsers,
    isConnected,
    isLoading,
    error,
    sendMessage,
    sendTypingIndicator,
    loadMoreMessages,
    clearError,
  } = useChat(roomSlug);

  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (content) => {
    const success = sendMessage(content, replyTo?.id || null);
    if (success) {
      setReplyTo(null);
    }
    return success;
  };

  const handleReply = (message) => {
    setReplyTo(message);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-muted-foreground animate-pulse">
          Loading chat...
        </span>
      </div>
    );
  }

  return (
    <Card className="h-[90vh] flex flex-col">
      <CardHeader className="flex flex-row justify-between items-center border-b">
        <h2 className="text-xl font-semibold">Room: {roomSlug}</h2>
        <ConnectionStatus isConnected={isConnected} />
      </CardHeader>

      <CardContent className="flex flex-1 overflow-hidden p-0">
        {/* Messages Section */}
        <div className="flex flex-col flex-1">
          {error && (
            <Alert variant="destructive" className="m-2">
              <AlertTitle>{error}</AlertTitle>
              <button
                onClick={clearError}
                className="ml-auto text-xs underline"
              >
                Dismiss
              </button>
            </Alert>
          )}

          <ScrollArea className="flex-1 p-4">
            <MessageList
              messages={messages}
              currentUser={currentUser}
              onReply={handleReply}
              onLoadMore={loadMoreMessages}
            />
            {typingUsers.length > 0 && (
              <p className="text-sm text-muted-foreground px-2 py-1">
                {typingUsers.join(", ")}{" "}
                {typingUsers.length === 1 ? "is" : "are"} typing...
              </p>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          <Separator />

          <CardFooter className="p-4">
            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={sendTypingIndicator}
              replyTo={replyTo}
              onCancelReply={handleCancelReply}
              disabled={!isConnected}
            />
          </CardFooter>
        </div>

        {/* Sidebar */}
        <aside className="w-64 border-l p-4">
          <OnlineUsers users={onlineUsers} />
        </aside>
      </CardContent>
    </Card>
  );
};

export default ChatRoom;
