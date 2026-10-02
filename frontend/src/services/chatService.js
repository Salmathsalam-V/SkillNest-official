// src/services/chatService.js
const listeners = {};
let ws = null;

function emit(event, data) {
  (listeners[event] || []).forEach(cb => cb(data));
}

export default {
  connect(roomUuid) {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsHost = "api.skillnestco.xyz";
    const url=`${wsProtocol}://${wsHost}/ws/community/${roomUuid}/`;
    ws = new WebSocket(url);
    ws.onopen = () => emit("connect");
    ws.onclose = () => emit("disconnect");
    ws.onerror = (e) => emit("error", e);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "chat_message") {
          emit("message", data.message);
        } else if (data.type === "translation_update") {
          emit("translation_update", { messageId: data.message_id, translated: data.translated });
        }
      else if (data.type === "typing_indicator") emit("typing", data);
      else if (data.type === "user_status_update") emit("userStatus", data);
    };

  },

  sendMessage(roomUuid, content, type = "text", media_url = null) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "chat_message",
          content,
          message_type: type,
          media_url,
        })
      );
    } else {
      console.warn("WebSocket not open. Cannot send message.");
    }
  },

  sendTyping(isTyping) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "typing", is_typing: isTyping }));
  },

  on(event, cb) {
    listeners[event] = listeners[event] || [];
    listeners[event].push(cb);
  },

  off(event, cb) {
    listeners[event] = (listeners[event] || []).filter(f => f !== cb);
  },

  disconnect() {
    if (ws) ws.close();
    ws = null;
  }
};


//  roomUuid, content, type = "text", media_url = null)