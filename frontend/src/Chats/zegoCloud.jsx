import { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

export const ZegoMeet = ({ token, roomName }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!token || !containerRef.current) {
      return;
    }

    const zp = ZegoUIKitPrebuilt.create(token);

    zp.joinRoom({
      container: containerRef.current,
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
    });

    return () => {
      try {
        zp.destroy();
      } catch (error) {
        console.error("Failed to destroy ZEGO instance:", error);
      }
    };
  }, [token, roomName]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100vh" }}
    />
  );
};
