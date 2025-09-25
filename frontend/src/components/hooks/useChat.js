// src/hooks/useChat.js

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import chatService from '../../services/chatService';

const useChat = (roomSlug) => {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const typingTimeoutRef = useRef();
  const isTypingRef = useRef(false);

  // API calls
  const fetchMessages = useCallback(async (page = 1) => {
    try {
      console.log("inside the useChat fetchMessages");
      const response = await axios.get(`/api/chat/rooms/${roomSlug}/messages/`, {
        params: { page }
      });
      
      if (page === 1) {
        setMessages(response.data.results.reverse());
      } else {
        setMessages(prev => [...response.data.results.reverse(), ...prev]);
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError('Failed to load messages');
      return null;
    }
  }, [roomSlug]);

  const fetchOnlineUsers = useCallback(async () => {
    try {
      const response = await axios.get(`/api/chat/rooms/${roomSlug}/online-users/`);
      setOnlineUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch online users:', error);
    }
  }, [roomSlug]);

  // WebSocket event handlers
  const handleNewMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
    
    // Remove typing indicator for this user
    setTypingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(message.sender.username);
      return newSet;
    });
  }, []);

  const handleUserStatus = useCallback((statusUpdate) => {
    console.log('User status update:', statusUpdate);
    // Refresh online users when someone joins/leaves
    fetchOnlineUsers();
  }, [fetchOnlineUsers]);

  const handleTyping = useCallback((typingData) => {
    setTypingUsers(prev => {
      const newSet = new Set(prev);
      if (typingData.isTyping) {
        newSet.add(typingData.username);
      } else {
        newSet.delete(typingData.username);
      }
      return newSet;
    });

    // Auto-remove typing indicator after 3 seconds
    setTimeout(() => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(typingData.username);
        return newSet;
      });
    }, 3000);
  }, []);

  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setError(null);
    fetchOnlineUsers();
  }, [fetchOnlineUsers]);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  const handleError = useCallback((errorData) => {
    setError(errorData.error);
  }, []);

  // Initialize chat
  useEffect(() => {
    if (!roomSlug) return;

    const initializeChat = async () => {
      setIsLoading(true);
      
      // Fetch initial messages
      await fetchMessages();
      
      // Connect to WebSocket
      chatService.connect(roomSlug);
      
      // Set up event listeners
      chatService.on('message', handleNewMessage);
      chatService.on('userStatus', handleUserStatus);
      chatService.on('typing', handleTyping);
      chatService.on('connect', handleConnect);
      chatService.on('disconnect', handleDisconnect);
      chatService.on('error', handleError);
      
      setIsLoading(false);
    };

    initializeChat();

    // Cleanup function
    return () => {
      chatService.off('message', handleNewMessage);
      chatService.off('userStatus', handleUserStatus);
      chatService.off('typing', handleTyping);
      chatService.off('connect', handleConnect);
      chatService.off('disconnect', handleDisconnect);
      chatService.off('error', handleError);
      
      chatService.disconnect();
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [roomSlug, handleNewMessage, handleUserStatus, handleTyping, handleConnect, handleDisconnect, handleError, fetchMessages]);

  // Chat actions
  const sendMessage = useCallback((content, replyTo = null) => {
    if (!content.trim()) return false;
    
    const success = chatService.sendMessage(content, replyTo);
    if (!success) {
      setError('Failed to send message. Please check your connection.');
    }
    
    return success;
  }, []);

  const sendTypingIndicator = useCallback((isTyping) => {
    if (isTyping && !isTypingRef.current) {
      chatService.sendTyping(true);
      isTypingRef.current = true;
      
      // Auto-stop typing after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        chatService.sendTyping(false);
        isTypingRef.current = false;
      }, 3000);
      
    } else if (!isTyping && isTypingRef.current) {
      chatService.sendTyping(false);
      isTypingRef.current = false;
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  }, []);

  const loadMoreMessages = useCallback(async () => {
    // This would need pagination logic based on your API
    // For now, just fetch page 2 as an example
    await fetchMessages(2);
  }, [fetchMessages]);

  const markMessagesAsRead = useCallback((messageIds) => {
    chatService.markMessagesRead(messageIds);
  }, []);

  return {
    // State
    messages,
    onlineUsers,
    typingUsers: Array.from(typingUsers),
    isConnected,
    isLoading,
    error,
    
    // Actions
    sendMessage,
    sendTypingIndicator,
    loadMoreMessages,
    markMessagesAsRead,
    refreshOnlineUsers: fetchOnlineUsers,
    
    // Utils
    clearError: () => setError(null)
  };
};

export default useChat;