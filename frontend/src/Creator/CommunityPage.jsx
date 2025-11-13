import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fetchMessages, sendMessage, fetchChatRoom,getMembers,searchUsers,removeMember,addMember, imageUpload ,createMeetingRoom,editMeetingRoom,getActiveMeeting   } from "../endpoints/axios";
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
import { text } from "@fortawesome/fontawesome-svg-core";
import { Loader }  from '@/components/Layouts/Loader';
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { Textarea } from "@/components/ui/textarea";
import {FeedbackModal} from '../Creator/FeedbackModal'
import { FeedbackListModal } from "../Creator/FeedbackListModal";


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
  const [pendingFile, setPendingFile] = useState(null);  // File object
  const [previewURL, setPreviewURL] = useState("");      // for <img>/<video> preview
  const messagesContainerRef = useRef(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const meetingSocketRef = useRef(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackListModalOpen, setFeedbackListModalOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
 // track who is typing
  const typingTimeoutRef = useRef(null);
  const isCreator = 
  community?.created_by?.id === userId ||
  community?.community?.creator?.id === userId;

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop === 0 && nextCursor && !loadingMore) {
        loadMoreMessages();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [nextCursor, loadingMore]);

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



// ✅ Initial load
const loadMessages = async () => {
  try {
    const { data } = await fetchMessages(communityId); // no cursor → first page
    setMessages(data.results.reverse());   // newest last
    setNextCursor(data.next);
  } catch (error) {
    console.error("Messages Error:", error);
  }
};

// ✅ Load older messages with cursor
const loadMoreMessages = async () => {
  if (!nextCursor) return;
  setLoadingMore(true);

  const container = messagesContainerRef.current;
  const prevScrollHeight = container.scrollHeight;

  try {
    const { data } = await axios.get(nextCursor, { withCredentials: true });
    setMessages(prev => [...data.results.reverse(), ...prev]);
    setNextCursor(data.next);

    // Restore scroll so user stays in same position
    setTimeout(() => {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - prevScrollHeight;
    }, 50);
  } catch (err) {
    console.error("Load more error:", err);
  } finally {
    setLoadingMore(false);
  }
};


const handleSend = async (mediaUrl = null) => {
  if (!newMessage.trim() && !mediaUrl) return;

  try {
    chatService.sendMessage(community.uuid, newMessage, "text", mediaUrl);

    const tempMessage = {
      content: newMessage,
      message_type: mediaUrl
        ? mediaUrl.match(/\.(mp4|webm|ogg)$/i)
          ? "video"
          : "image"
        : "text",
      media_url: mediaUrl,
      sender: { id: userId, username: "You" },
      timestamp: new Date().toISOString(),
    };

    console.log("tempMessage: ",tempMessage)
    setNewMessage("");
  } catch (error) {
    console.error("Send Error:", error);
  }
};


const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setUploading(true);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "skillnest_profile");

  try {
    const res = await imageUpload( formData);
    const url = res.data.secure_url;
    console.log("url1:",url)
    let messageType = "file";
    if (file.type.startsWith("image/")) messageType = "image";
    else if (file.type.startsWith("video/")) messageType = "video";

    // ✅ Send the URL via WebSocket
    chatService.sendMessage(community.uuid, "", messageType, url);

    toast.success("Media sent!");
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
    toast.success("Send invitation to member");
    setMembersModalOpen(false); 
    setSearchResults([]);
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
    setMembersModalOpen(false); 
    setSearchResults([]);
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
    checkActiveMeeting();
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
  
const handleSendPendingFile = async () => {
  if (!pendingFile) return;
  setUploading(true);
  const formData = new FormData();
  formData.append("file", pendingFile);
  formData.append("upload_preset", "skillnest_profile");

  try {
    const res = await imageUpload(
      formData
    );
    console.log("res data:",res)
    const url = res.data.url;
    console.log("url:2",url)
    let msgType = "file";
    if (pendingFile.type.startsWith("image/")) msgType = "image";
    else if (pendingFile.type.startsWith("video/")) msgType = "video";
    console.log("url2: ",msgType,url)
    // ✅ Send uploaded file via WebSocket
    chatService.sendMessage(community.uuid, "", msgType, url);

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


useEffect(() => {
  console.log("useEffect for chatService with communityId:", communityId, "and community:", community);
  if (!community?.uuid) return; // wait until community/room info is ready
  console.log("Connecting to chat service for room:", community.uuid);
  chatService.connect(community.uuid);

  // listen for messages
  chatService.on("message", (message) => {
    console.log("send messages compge: ",message)
    setMessages(prev => [...prev, message]);
  });
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

  // chatService.on("typing", (data) => {
  //   // optional: handle typing indicator
  // });

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

  chatService.on("connect", () => console.log("WS connected"));
  chatService.on("disconnect", () => console.log("WS disconnected from chat service"));


  // cleanup when leaving page
  return () => chatService.disconnect();
}, [community?.uuid]);



// ✅ Separate WebSocket connection logic
useEffect(() => {
  if (!communityId) return;

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const ws = new WebSocket(
    `${protocol}://127.0.0.1:8000/ws/community/${communityId}/meeting/`
  );
    meetingSocketRef.current = ws;
    console.log("ws",ws)
  ws.onopen = () => {
    console.log("✅ Meeting WebSocket connected!");
  };

   ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("📩 Meeting WebSocket message:", data);
      if (data.type === "meeting_started") {
        console.log("data",data);
        
        toast.info(`📢 ${userId} started a video call`);
        setMeetingInfo(data.meeting);
      }
    } catch (err) {
      console.error("Failed to parse meeting message:", err);
    }
  };
  ws.onerror = (error) => {
    console.error("Meeting WebSocket error:", error);
  };
  ws.onclose = (event) => {
    console.log("Meeting WebSocket closed:", event.code, event.reason);
  };

  // ✅ Cleanup function
  return () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      console.log("Closing meeting WebSocket...");
      ws.close();
    }
  };
}, [communityId]); // ✅ Only re-run when communityId changes


// ✅ Remove the duplicate useEffect that was causing issues
// Delete this:
// useEffect(() => {
//   if (isMeetingOpen && meetingInfo) {
//     startZegoCall(meetingInfo);
//   }
// }, [isMeetingOpen, meetingInfo]);


// ✅ Update startVideoCall to call startZegoCall directly
const startVideoCall = async () => {
  try {
    const res = await createMeetingRoom(communityId);
    const meetingData = res.data;
    setMeetingInfo(meetingData);
    setIsMeetingOpen(true);
    
    // ✅ Start Zego call immediately after opening dialog
    setTimeout(() => startZegoCall(), 100); // Small delay to ensure DOM is ready
    const socket = meetingSocketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({
        type: "start_meeting",
        meeting: meetingData,
      });
      console.log("payload",payload);
      socket.send(payload);
      console.log("📤 Sent start_meeting event:", payload);
    } else {
      console.warn("⚠️ Meeting WebSocket not open yet.");
    }
  } catch (err) {
    console.error("Failed to start meeting:", err);
    toast.error("Failed to start meeting");
  }
};


// ✅ Update startZegoCall to not create another meeting room
const startZegoCall = async () => {
  try {
    // ✅ Use existing meetingInfo if available, otherwise create new room
    let roomData;
    if (meetingInfo) {
      roomData = meetingInfo;
      console.log("Using existing meeting info:", roomData);
    } else {
      const res = await createMeetingRoom(communityId);
      roomData = res.data;
      console.log("Created new meeting room:", roomData);
    }

    const { roomName, appID } = roomData;

    if (!roomName || !appID) {
      console.error("Missing required fields:", roomData);
      toast.error("Failed to initialize video call");
      return;
    }

    console.log("Joining room:", roomName, "with userID:", userId);

    // ✅ Generate Kit Token client-side
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      Number(appID),
      "b5760c71682586e629b772f8fa71570f",
      roomName,
      String(userId),
      user?.username || "Guest User"
    );

    console.log("Generated Kit Token:", kitToken.substring(0, 20) + "...");

    // ✅ Check if container exists
    const container = document.getElementById("zego-container");
    if (!container) {
      console.error("Zego container not found!");
      // toast.error("Video container not ready");
      return;
    }

    // ✅ Create ZegoUIKitPrebuilt instance
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    
    // ✅ Join the room
    zp.joinRoom({
      container: container,
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
      showPreJoinView: true,
      showScreenSharingButton: true,
      showTurnOffRemoteCameraButton: true,
      showTurnOffRemoteMicrophoneButton: true,
      showRemoveUserButton: true,

      onLeaveRoom: async () => {
        console.log("User left the room");
        setIsMeetingOpen(false);
        setMeetingInfo(null);

        // ✅ End meeting in backend if host
        console.log("Before checking host:roomData",meetingInfo,meetingInfo?.meeting_id );
        const isHost =
          community?.created_by?.id === userId ||
          community?.community?.creator?.id === userId;
        console.log("Is current user host?", isHost);
        if (isHost && meetingInfo?.meeting_id) {
          try {
            console.log("Ending meeting in backend for room:before axios", meetingInfo.meeting_id);
            await editMeetingRoom(meetingInfo.meeting_id);
            console.log("✅ Meeting ended successfully in backend");
          } catch (err) {
            console.error("❌ Failed to end meeting:", err);
          }
        }
      },
    });

    
  } catch (err) {
    console.error("Error starting Zego call:", err);
    toast.error("Failed to start/end video call");
  }
};

useEffect(() => {
  if (isMeetingOpen && meetingInfo) {
    console.log("🔹 Joining ongoing meeting:", meetingInfo);
    startZegoCall(); // ✅ call function to join
  }
}, [isMeetingOpen, meetingInfo]);

const checkActiveMeeting = async () => {
  try {
    const res = await getActiveMeeting(communityId);
    if (res.active_meeting && res.active_meeting.is_active) {
      console.log("🟢 Active meeting found:", res.active_meeting);
      setMeetingInfo(res.active_meeting);
    }
  } catch (err) {
    console.error("Failed to check active meeting:", err);
  }
};

useEffect(() => {
  const interval = setInterval(checkActiveMeeting, 15000); // every 15s
  return () => clearInterval(interval);
}, []);

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

  if (!community) return <Loader text="Loading Chats..." />; 
  

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
            {(community?.created_by?.id === userId ||
              community?.community?.creator?.id === userId) && (
              <Button onClick={startVideoCall} className="ml-auto">
                🎥 Start Video Call
              </Button>
            )}
            {/* Show join button for participants when a meeting is active */}
              {meetingInfo && !isMeetingOpen &&
                    (community?.created_by?.id !== userId &&
                    community?.community?.creator?.id !== userId) && (
                      <Button
                        onClick={() => {
                          setIsMeetingOpen(true);
                          setTimeout(() => startZegoCall(), 300);
                        }}
                        className="ml-auto bg-green-600 hover:bg-green-700"
                      >
                        🚀 Join Ongoing Call
                      </Button>
                  )}




          </div>
        </CardContent>
      </Card>

<div
  ref={messagesContainerRef}
  className="flex-1 overflow-y-auto p-4 space-y-3"
>
  {loadingMore && (
    <p className="text-center text-gray-500 text-sm">Loading older messages...</p>
  )}

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


      {pendingFile && (
        <div className="p-3 border-t bg-white flex items-center gap-4">
          {pendingFile.type.startsWith("image/") ? (
            <img src={previewURL} alt="preview"
                className="h-24 w-auto rounded-md border" />
          ) : pendingFile.type.startsWith("video/") ? (
            <video src={previewURL} controls
                  className="h-24 w-auto rounded-md border" />
          ) : (
            <p className="text-sm">{pendingFile.name}</p>
          )}

          <Button
            variant="destructive"
            onClick={() => {          // Cancel
              setPendingFile(null);
              setPreviewURL("");
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={() => handleSendPendingFile()}   // defined next
          >
            Send File
          </Button>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t bg-white flex items-center space-x-2">
      <Input
        placeholder="Type a message..."
        value={newMessage}
        onChange={handleTyping}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
     {/* <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            id="chat-upload"
            onChange={handleFileUpload}
          /> */}
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            id="chat-upload"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              setPendingFile(file);
              setPreviewURL(URL.createObjectURL(file));
            }}
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
    {isCreator ? (
      <Dialog open={membersModalOpen}
         onOpenChange={(open) => {setMembersModalOpen(open);
          if (open) loadMembers()}}>
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
            {members?.length > 0 ? (
              members.map((member) => (
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
                    onClick={() => handleRemoveMember(member.email)}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">No members yet.</p>
            )}
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
    ) : 
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
    }
      {/* Feedback options */}
      {(community?.created_by?.id === userId ||
        community?.community?.creator?.id === userId) ? (
        <Button
          variant="outline"
          className="ml-2"
          onClick={() => setFeedbackModalOpen(true)}
        >
          💬 Send Feedback
        </Button>
      ) : (
        <Button
          variant="outline"
          className="ml-2"
          onClick={() => setFeedbackListModalOpen(true)}
        >
          📋 View Feedback
        </Button>
      )}

     
      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        communityId={communityId}
        members={members}
        creatorId={userId}
        userId={userId}
        />
        <FeedbackListModal
          open={feedbackListModalOpen}
          onOpenChange={setFeedbackListModalOpen}
          communityId={communityId}
        />

      <Dialog open={isMeetingOpen} onOpenChange={setIsMeetingOpen}>
        <DialogContent className="max-w-5xl w-full h-[80vh] p-0">
          <DialogHeader>
            <DialogTitle>Community Video Call</DialogTitle>
          </DialogHeader>
          <div id="zego-container" className="w-full h-full rounded-lg overflow-hidden"></div>
        </DialogContent>
      </Dialog>



    </CreatorLayout>   
  );
};