// src/components/JoinJitsiButton.jsx
import React, { useState } from "react";
import axios from "axios";
import JitsiMeeting from "./JitsiMeeting";

// Example modal using simple markup. Replace with your UI/Dialog components.
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg w-[90%] max-w-4xl p-4">
        <button className="float-right" onClick={onClose}>Close</button>
        <div className="clear-both">{children}</div>
      </div>
    </div>
  );
};

const JoinJitsiButton = ({ communityId, user }) => {
  const [open, setOpen] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/meetings/create-room/", { community_id: communityId }, { withCredentials: true });
      setRoomInfo(res.data);
      setOpen(true);
    } catch (err) {
      console.error("Failed to create room", err);
      alert("Failed to create or join meeting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-4 py-2 rounded-md shadow"
        onClick={handleJoin}
        disabled={loading}
      >
        {loading ? "Preparing…" : "Join Video Call"}
      </button>

      <Modal open={open} onClose={() => { setOpen(false); setRoomInfo(null); }}>
        {roomInfo ? (
          <JitsiMeeting
            domain={roomInfo.domain}
            roomName={roomInfo.roomName}
            jwt={roomInfo.jwt}
            userInfo={{ displayName: user?.fullname || user?.username, email: user?.email }}
          />
        ) : (
          <div>Loading meeting…</div>
        )}
      </Modal>
    </>
  );
};

export default JoinJitsiButton;
