// src/hooks/useMessages.ts
import { useState, useEffect, useCallback } from 'react';

interface Message {
  _id: string;
  sender: { _id: string; name: string; username: string; avatar?: string };
  recipient: { _id: string; name: string; username: string; avatar?: string };
  content: string;
  read: boolean;
  createdAt: string;
}

export const useMessages = (selectedUserId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (userId: string) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Send a new message
  const sendMessage = async (content: string, recipientId: string): Promise<Message | null> => {
    if (!content.trim() || !recipientId) return null;

    try {
      const response = await fetch('http://localhost:8000/api/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recipientId,
          content
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const newMessage = data.data;
      
      // Optimistic update
      setMessages(prev => [...prev, newMessage]);
      
      return newMessage;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return null;
    }
  };

  // Mark messages as read
  const markAsRead = async (messageIds: string[]) => {
    try {
      await fetch('http://localhost:8000/api/v1/messages/mark-read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ messageIds })
      });

      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          messageIds.includes(msg._id) ? { ...msg, read: true } : msg
        )
      );
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  // Load messages when selected user changes
  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
    } else {
      setMessages([]);
    }
  }, [selectedUserId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    fetchMessages
  };
};