import { useEffect, useRef } from "react";
import {
  ZegoUIKitPrebuilt,
} from "@zegocloud/zego-uikit-prebuilt";

export const ZegoMeet = ({
  token,
  roomName,
  onLeave,
}) => {
  const containerRef = useRef(null);
  const zpRef = useRef(null);

  useEffect(() => {
    if (!token || !roomName || !containerRef.current) {
      return;
    }

    let cancelled = false;

    const zp = ZegoUIKitPrebuilt.create(token);
    zpRef.current = zp;

    const join = async () => {
      try {
        await zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference,
          },
          showPreJoinView: true,
          showScreenSharingButton: true,
          showTurnOffRemoteCameraButton: true,
          showTurnOffRemoteMicrophoneButton: true,
          showRemoveUserButton: true,
          onLeaveRoom: () => {
            onLeave?.();
          },
        });
      } catch (error) {
        if (!cancelled) {
          console.error("Zego join failed:", error);
        }
      }
    };

    join();

    return () => {
      cancelled = true;

      if (zpRef.current === zp) {
        zpRef.current = null;
      }

      try {
        zp.destroy();
      } catch (error) {
        console.error("Zego cleanup failed:", error);
      }
    };
  }, [token, roomName]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
};
