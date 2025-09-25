import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fetchMessages, sendMessage, fetchChatRoom,getMembers,searchUsers,removeMember,addMember   } from "../endpoints/axios";
import CreatorLayout from "@/components/Layouts/CreatorLayout";
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog"; 
import { X } from "lucide-react";
import chatService from "../services/chatService";

export const CommunityPage = () => {
  const { communityId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [community, setCommunity] = useState(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [membersModalOpen, setMembersModalOpen] = useState(false);

  //load chat room
  const loadChatRoom = async () => {
    try {
      const { data } = await fetchChatRoom(communityId);
      setCommunity(data);
      console.log("Fetched community chat room:", data);
    } catch (error) {
      console.error("ChatRoom Error:", error);
    }
  };

  // ✅ Load Messages
  const loadMessages = async () => {
    try {
      const { data } = await fetchMessages(communityId);
      console.log("Fetched messages:", data);
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
const loadMembers = async () => {
  try {
    const data = await getMembers(communityId); // pass it here
    setMembers(data.members || []);
    console.log("Members loaded:", data);
  } catch (err) {
    console.error("Failed to load members:", err);
  }
};

// Add member
const handleAddMember = async (identifier) => {
  try {
    console.log("Adding member:", identifier);
    const res = await addMember(communityId, identifier); // just string
    setMembers(res.members); // res.data is the CommunitySerializer output
    setNewMember("");
    toast.success("Member added");
  } catch (err) {
    console.error(err);
    toast.error("Failed to add member");
  }
};


const handleRemoveMember = async (identifier) => {
  try {
    const data = await removeMember(communityId, identifier);
    setMembers(data.members);      // ✅ data, not data.members
    toast.success("Member removed");
  } catch (err) {
    console.error(err);
    toast.error("Failed to remove member");
  }
};


  const handleSearch = async (q) => {
  if (!q) return setSearchResults([]);
    try {
      const results = await searchUsers(q);
      setSearchResults(results);
    } catch (e) {
      // optional: toast.error("Failed to search users");
      setSearchResults([]);
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
  
// useEffect(() => {
//   console.log("Setting up WebSocket connection for community chat", communityId);
//   const protocol = window.location.protocol === "https:" ? "wss" : "ws";
//   console.log("WebSocket protocol:", protocol);
//   const ws = new WebSocket(`${protocol}://${window.location.host}/ws/community/${communityId}/`);
//   console.log("after creating WebSocket");
//   console.log("WebSocket instance:", ws);
//   ws.onmessage = (e) => {
//     const data = JSON.parse(e.data);
//     console.log("WebSocket message received:inside the useffect", data);
//     if (data.type === "chat_message") {
//       setMessages((prev) => [...prev, data.message]);
//     }
//   };

//   ws.onclose = () => console.log("WS closed");
//   return () => ws.close();
// }, [communityId]);

useEffect(() => {
  console.log("useEffect for chatService with communityId:", communityId, "and community:", community);
  if (!community?.uuid) return; // wait until community/room info is ready
  console.log("Connecting to chat service for room:", community.uuid);
  chatService.connect(community.uuid);

  // listen for messages
  chatService.on("message", (message) => {
    setMessages(prev => [...prev, message]);
  });

  chatService.on("typing", (data) => {
    // optional: handle typing indicator
  });

  chatService.on("userStatus", (data) => {
    // optional: handle online/offline updates
  });

  chatService.on("connect", () => console.log("WS connected"));
  chatService.on("disconnect", () => console.log("WS disconnected"));

  // cleanup when leaving page
  return () => chatService.disconnect();
}, [community?.uuid]);


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
{/* ✅ Date below the bubble */}
      <span className="text-[10px] text-gray-400 mt-1">
        {new Date(msg.timestamp).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })}
      </span>
                
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
    {/* Members Modal */}
      <Dialog onOpenChange={(open) => open && loadMembers()}>
        <DialogTrigger asChild>
          <Button variant="outline">Manage Members</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Community Members</DialogTitle>
            <DialogDescription>
              Add or remove members from this community.
            </DialogDescription>
          </DialogHeader>

          {/* Member List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {members.map((member) => (
              <div
                key={member.email}
                className="flex items-center justify-between bg-gray-100 p-2 rounded-lg"
              >
                <span>
                  {member.username} ({member.email})
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(member.email)} // or member.id
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>


          {/* Add Member */}
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="Search by username or email..."
              value={newMember}
              onChange={(e) => {
                setNewMember(e.target.value);
                handleSearch(e.target.value);
              }}
            />
            {searchResults.length > 0 && (
              <div className="bg-white border rounded mt-2">
                {searchResults.map((u) => (
                  <div
                    key={u.email}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleAddMember(u.email)} // send username
                  >
                    {u.username} ({u.email})
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </CreatorLayout>   
  );
};
