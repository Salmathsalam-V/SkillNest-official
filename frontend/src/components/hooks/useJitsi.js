// src/hooks/useJitsi.js
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";

export function useJitsi({ domain, roomName, jwt, userInfo, onApiReady } = {}) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadScript = useCallback((domainUrl) => {
    return new Promise((resolve, reject) => {
      // avoid duplicate script
      const existing = document.querySelector(`script[data-jitsi-domain="${domainUrl}"]`);
      if (existing) {
        if ((window.JitsiMeetExternalAPI)) return resolve();
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", (e) => reject(e));
        return;
      }
      const script = document.createElement("script");
      script.src = domainUrl.startsWith("http")
        ? `${domainUrl}/external_api.js`
        : `https://${domainUrl}/external_api.js`;
      script.async = true;
      script.setAttribute("data-jitsi-domain", domainUrl);
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.body.appendChild(script);
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    const start = async () => {
      setLoading(true);
      try {
        // ensure script is loaded
        await loadScript(domain);

        if (!mounted) return;
        // domain should be hostname only (without protocol) for constructor
        // e.g., 'meet.jit.si' or 'meet.yourdomain.com'
        const domainHost = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
        const options = {
          roomName,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
          },
          interfaceConfigOverwrite: {
            // any interface changes
          },
          userInfo: userInfo || {}
        };

        // If JWT present, some Jitsi configs expect it as part of the constructor options:
        if (jwt) {
          options.jwt = jwt;
        }

        apiRef.current = new window.JitsiMeetExternalAPI(domainHost, options);

        // optional: expose ready state to parent
        apiRef.current.addListener("videoConferenceJoined", () => {
          onApiReady && onApiReady(apiRef.current);
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to load Jitsi script", err);
        setError(err);
        setLoading(false);
      }
    };

    start();

    return () => {
      mounted = false;
      try {
        apiRef.current && apiRef.current.dispose();
        apiRef.current = null;
      } catch (e) {
        // ignore
      }
    };
  }, [domain, roomName, jwt, userInfo, loadScript, onApiReady]);

  return { containerRef, apiRef, loading, error };
}
