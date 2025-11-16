import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fetchMessages, sendMessage, fetchChatRoom, imageUpload, getMembers, getActiveMeeting,translateText,markAsRead } from "../endpoints/axios";
import LearnerLayout from "@/components/Layouts/LearnerLayout";
import { toast } from "sonner";
import chatService from "../services/chatService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FeedbackListModal } from "@/Creator/FeedbackListModal";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";


export const CommunityPageLearner = () => {
  const { communityId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [community, setCommunity] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const messagesEndRef = useRef(null);
  const [members, setMembers] = useState([]);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  
  const typingTimeoutRef = useRef(null);

  const user = useSelector((state) => state.user.user);
  const userId = user?.id;

  // --- Load Community ---
  const loadChatRoom = async () => {
    try {
      const { data } = await fetchChatRoom(communityId);
      setCommunity(data);
      markMessagesAsRead(data.uuid);
    } catch (error) {
      console.error("ChatRoom Error:", error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data } = await fetchMessages(communityId);
      setMessages(data.results.reverse());
    } catch (error) {
      console.error("Messages Error:", error);
    }
  };

  // --- Send Text ---
  const handleSend = async (mediaUrl = null, type = "text") => {
    if (!newMessage.trim() && !mediaUrl) return;
    try {
      chatService.sendMessage(community.uuid, newMessage, type, mediaUrl);
      setNewMessage("");
    } catch (error) {
      console.error("Send Error:", error);
    }
  };

  // --- Upload Media ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFile(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  const handleSendPendingFile = async () => {
    if (!pendingFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", pendingFile);
    formData.append("upload_preset", "skillnest_profile");
    try {
      const res = await imageUpload(formData);
      const url = res.data.url;
      let msgType = "file";
      if (pendingFile.type.startsWith("image/")) msgType = "image";
      else if (pendingFile.type.startsWith("video/")) msgType = "video";
      await handleSend(url, msgType);
      toast.success("File sent!");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      setPendingFile(null);
      setPreviewURL("");
    }
  };

  // --- WebSocket ---
// useEffect(() => {
//   if (!community?.uuid) return;
//   chatService.connect(community.uuid);

//   const handleMessage = (m) => setMessages(prev => [...prev, m]);

//   const handleTranslation = ({ messageId, translated }) => {
//     setMessages(prev =>
//       prev.map(msg => (msg.id === messageId ? { ...msg, translated } : msg))
//     );
//   };

//   chatService.on("message", handleMessage);
//   chatService.on("translation_update", handleTranslation);

//   return () => {
//     chatService.off("message", handleMessage);
//     chatService.off("translation_update", handleTranslation);
//     chatService.disconnect();
//   };
// }, [community?.uuid]);

  // --- Auto-scroll ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => scrollToBottom(), [messages]);

  // --- Loaders ---
  useEffect(() => {
    loadChatRoom();
    loadMessages();
  }, [communityId]);

  const loadMembers = async () => {
    try {
      const data = await getMembers(communityId);
      setMembers(data.members || []);
    } catch (err) {
      console.error("Failed to load members:", err);
    }
  };

  const markMessagesAsRead = async(room_uuid)=> {
      console.log("Fetched chatroom uuid:", room_uuid);
        await markAsRead(room_uuid);
    };
  // 🆕 Check for Active Meeting
  const checkActiveMeeting = async () => {
    try {
      const res = await getActiveMeeting(communityId);
      if (res.active_meeting && res.active_meeting.is_active) {
        setMeetingInfo(res.active_meeting);
      } else {
        setMeetingInfo(null);
      }
    } catch (err) {
      console.error("Failed to check active meeting:", err);
    }
  };

  useEffect(() => {
    checkActiveMeeting(); // check once initially
    const interval = setInterval(checkActiveMeeting, 10000);
    return () => clearInterval(interval);
  }, []);
  // Function to initialize Zego meeting
  const startZegoCall = async () => {
    if (!meetingInfo) {
      toast.error("No active meeting found");
      return;
    }

    const { roomName, appID } = meetingInfo;
    if (!roomName || !appID) {
      toast.error("Invalid meeting info");
      return;
    }

    // Generate token
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      Number(appID),
      "b5760c71682586e629b772f8fa71570f", // your serverSecret/test key
      roomName,
      String(userId),
      user?.username || "Guest"
    );

    const container = document.getElementById("zego-container");
    if (!container) {
      console.error("Zego container not found!");
      return;
    }

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container,
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
    });
  };

  // Run when modal opens
  useEffect(() => {
    if (isMeetingOpen && meetingInfo) {
      console.log("🔹 Learner joining meeting...");
      startZegoCall();
    }
  }, [isMeetingOpen, meetingInfo]);

  useEffect(() => {
  if (!community?.uuid) return;

  chatService.connect(community.uuid);

  chatService.on("message", (msg) => setMessages((prev) => [...prev, msg]));

  chatService.on("typing", (data) => {
      const { user_id, username, is_typing } = data;
  
      if (user_id === userId) return; // ignore yourself
      console.log("Typing data received:", data);
      console.log("Current typingUsers before update:",username , is_typing);
      setTypingUsers((prev) => {
        if (is_typing) {
          // add user if not already in list
          if (!prev.includes(username)) return [...prev, username];
          return prev;
        } else {
          // remove user
          return prev.filter((u) => u !== username);
        }
      });
    });
    chatService.on("userStatus", (data) => {
      if (data.is_typing !== undefined) {
        // This is a typing event
        console.log(`${data.username} is typing?`, data.is_typing);
          
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (data.is_typing) newSet.add(data.username);
            else newSet.delete(data.username);
            return newSet;
          });
        } else if (data.status) {
      // This is online/offline
      console.log(`${data.username} is ${data.status}`);
    }
      // optional: handle online/offline updates
    });

  return () => chatService.disconnect();
}, [community?.uuid]);


  const handleTyping = (e) => {
  setNewMessage(e.target.value);

  // Notify others that this user is typing
  chatService.sendTyping(true);

  // Clear previous timeout
  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

  // Stop typing after 2 seconds of inactivity
  typingTimeoutRef.current = setTimeout(() => {
    chatService.sendTyping(false);
  }, 2000);
};


  if (!community) return <p>Loading community...</p>;

  return (
    <LearnerLayout>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* ---- Header ---- */}
        <Card className="rounded-none shadow-md">
          <CardContent className="flex items-center space-x-3 p-4">
            <Avatar>
              <AvatarImage
                src={
                  community.community?.creator?.profile ||
                  community.created_by?.profile ||
                  ""
                }
                alt={
                  community.community?.creator?.username ||
                  community.created_by?.username ||
                  ""
                }
              />
              <AvatarFallback>
                {(
                  community.community?.creator?.username ||
                  community.created_by?.username ||
                  "?"
                )[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{community.name}</h2>
              <p className="text-sm text-gray-500">
                by{" "}
                {community.community?.creator?.username ||
                  community.created_by?.username}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 🆕 Active Meeting Banner */}
        {meetingInfo && (
          <div className="bg-green-100 text-green-800 p-3 flex justify-between items-center shadow-md">
            <span>
              🟢 A live session is ongoing: <b>{meetingInfo.title || "Community Meet"}</b>
            </span>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setIsMeetingOpen(true)}
            >
              Join Meet
            </Button>
          </div>
        )}

        {/* 🆕 Community Video Call Modal */}
        <Dialog open={isMeetingOpen} onOpenChange={setIsMeetingOpen}>
          <DialogContent className="max-w-5xl w-full h-[80vh] p-0">
            <DialogHeader>
              <DialogTitle>Community Video Call</DialogTitle>
            </DialogHeader>
            <div id="zego-container" className="w-full h-full rounded-lg overflow-hidden"></div>
          </DialogContent>
        </Dialog>


        {/* ---- Chat Messages ---- */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => {
            const isMine = msg?.sender?.id === userId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
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
                  {msg.translated ? (
                    <p>
                      {msg.translated}
                      <span className="block text-xs text-gray-400 italic mt-1">
                        (original: {msg.content})
                      </span>
                    </p>
                  ) : (
                    <p>{msg.content}</p>
                  )}

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
                <span className="text-[10px] text-gray-400 mt-1">
                  {new Date(msg.timestamp).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })}
          <div className="text-sm text-gray-500 mt-1">
            {typingUsers.size > 0 && (
            <p className="text-sm text-gray-500">
              {Array.from(typingUsers).join(", ")} {typingUsers.size > 1 ? "are" : "is"} typing...
            </p>
          )}
          </div>

          <div ref={messagesEndRef}></div>
        </div>

        {/* ---- Pending File Preview ---- */}
        {pendingFile && (
          <div className="p-3 border-t bg-white flex items-center gap-4">
            {pendingFile.type.startsWith("image/") ? (
              <img src={previewURL} alt="preview" className="h-24 w-auto rounded-md border" />
            ) : pendingFile.type.startsWith("video/") ? (
              <video src={previewURL} controls className="h-24 w-auto rounded-md border" />
            ) : (
              <p className="text-sm">{pendingFile.name}</p>
            )}
            <Button variant="destructive" onClick={() => { setPendingFile(null); setPreviewURL(""); }}>
              Cancel
            </Button>
            <Button onClick={handleSendPendingFile}>Send File</Button>
          </div>
        )}

        {/* ---- Chat Input ---- */}
        <div className="p-4 border-t bg-white flex items-center space-x-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleTyping}
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
            {uploading ? "⏳" : "📎"}
          </label>
          <Button onClick={() => handleSend()}>Send</Button>
        </div>
      </div>

      {/* ---- Members Modal ---- */}
      <Dialog
        open={membersModalOpen}
        onOpenChange={(open) => {
          setMembersModalOpen(open);
          if (open) loadMembers();
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline">Community Members</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Community Members</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {members.length > 0 ? (
              members.map((m) => (
                <div key={m.email} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                  <span>{m.username} ({m.email})</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">No members yet.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Button variant="outline" onClick={() => setShowFeedbackModal(true)}>
        View My Feedback
      </Button>

      <FeedbackListModal
        open={showFeedbackModal}
        onOpenChange={setShowFeedbackModal}
        communityId={communityId}
      />


    </LearnerLayout>
  );
};
