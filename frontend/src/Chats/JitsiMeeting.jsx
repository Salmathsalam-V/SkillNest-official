// src/components/JitsiMeeting.jsx
import React from "react";
import { useJitsi } from "../hooks/useJitsi";

const JitsiMeeting = ({ domain, roomName, jwt, userInfo, style }) => {
  const { containerRef, loading, error } = useJitsi({ domain, roomName, jwt, userInfo });

  if (loading) return <div className="p-4">Loading meeting…</div>;
  if (error) return <div className="p-4 text-red-600">Failed to load meeting</div>;

  return (
    <div style={{ width: "100%", height: "700px", ...style }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default JitsiMeeting;
