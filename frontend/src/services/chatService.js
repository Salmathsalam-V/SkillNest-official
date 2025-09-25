// src/services/chatService.js
const listeners = {};
let ws = null;

function emit(event, data) {
  (listeners[event] || []).forEach(cb => cb(data));
}

export default {
  connect(roomUuid) {
    console.log("chatService: connecting to room", roomUuid);
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    // const url = `${protocol}://${window.location.host}/ws/community/${roomUuid}/`;
    // url = new WebSocket(`${protocol}://127.0.0.1:8000/ws/community/${roomUuid}/`);
    const url=`${protocol}://127.0.0.1:8000/ws/community/${roomUuid}/`;
    console.log("WebSocket URL:url:", url);
    ws = new WebSocket(url);

    ws.onopen = () => emit("connect");
    ws.onclose = () => emit("disconnect");
    ws.onerror = (e) => emit("error", e);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "chat_message") emit("message", data.message);
      else if (data.type === "typing_indicator") emit("typing", data);
      else if (data.type === "user_status_update") emit("userStatus", data);
    };
  },

  sendMessage(content) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify({ type: "chat_message", content }));
    return true;
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
