// src/services/chatService.js

class ChatService {
  constructor() {
    this.socket = null;
    this.roomSlug = null;
    this.reconnectInterval = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = {
      message: [],
      userStatus: [],
      typing: [],
      error: [],
      connect: [],
      disconnect: []
    };
  }

  connect(roomSlug, token) {
    this.roomSlug = roomSlug;
    const wsUrl = `ws://localhost:8000/ws/chat/${roomSlug}/`;
    
    try {
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = (event) => {
        console.log('WebSocket connected to room:', roomSlug);
        this.reconnectAttempts = 0;
        this.clearReconnectInterval();
        this.emit('connect', { roomSlug });
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.emit('disconnect', { code: event.code, reason: event.reason });
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', { error: 'WebSocket connection error' });
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.emit('error', { error: 'Failed to create WebSocket connection' });
    }
  }

  disconnect() {
    this.clearReconnectInterval();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(content, replyTo = null) {
    if (this.isConnected()) {
      const message = {
        type: 'chat_message',
        content: content.trim(),
        reply_to: replyTo
      };
      
      this.socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  sendTyping(isTyping) {
    if (this.isConnected()) {
      const message = {
        type: 'typing',
        is_typing: isTyping
      };
      
      this.socket.send(JSON.stringify(message));
    }
  }

  markMessagesRead(messageIds) {
    if (this.isConnected()) {
      const message = {
        type: 'mark_read',
        message_ids: messageIds
      };
      
      this.socket.send(JSON.stringify(message));
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case 'chat_message':
        this.emit('message', data.message);
        break;
        
      case 'typing_indicator':
        this.emit('typing', {
          userId: data.user_id,
          username: data.username,
          isTyping: data.is_typing
        });
        break;
        
      case 'user_status_update':
        this.emit('userStatus', {
          userId: data.user_id,
          username: data.username,
          status: data.status,
          message: data.message
        });
        break;
        
      case 'error':
        this.emit('error', { error: data.message });
        break;
        
      case 'pong':
        // Handle ping/pong for connection health
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  // Event listener management
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Connection management
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  scheduleReconnect() {
    if (this.reconnectInterval) return;
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectInterval = setTimeout(() => {
      this.reconnectInterval = null;
      if (this.roomSlug) {
        this.connect(this.roomSlug);
      }
    }, delay);
  }

  clearReconnectInterval() {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  // Health check
  ping() {
    if (this.isConnected()) {
      this.socket.send(JSON.stringify({ type: 'ping' }));
    }
  }
}

// Create singleton instance
const chatService = new ChatService();
export default chatService;