import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

export const ZegoMeet = ({ appID, token, roomName }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const zp = ZegoUIKitPrebuilt.create(appID, token);
    zp.joinRoom({
      container: containerRef.current,
      scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
    });
  }, [appID, token, roomName]);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
};
