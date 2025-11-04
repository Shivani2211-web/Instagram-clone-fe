import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/api';
import { io, Socket } from 'socket.io-client';
import { MESSAGES } from '../api/endpoints';

type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface IMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
    username: string;
  };
  recipient: {
    _id: string;
    name: string;
    avatar?: string;
    username: string;
  };
  content: string;
  contentHash?: string;
  read: boolean;
  status?: MessageStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface IConversation {
  _id: string;
  user: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
  lastMessageAt: string;
}

interface MessageContextType {
  // State
  conversations: IConversation[];
  currentConversation: IMessage[];
  currentRecipient: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
    isTyping?: boolean;
    lastSeen?: string;
  } | null;
  loading: boolean;
  error: string | null;
  isTyping: boolean;
  onlineUsers: Record<string, boolean>;
  
  // Methods
  sendMessage: (content: string, recipientId: string) => Promise<void>;
  loadConversation: (userId: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  markAsRead: (messageIds: string[]) => Promise<void>;
  setTyping: (isTyping: boolean, recipientId: string) => void;
  verifyMessageIntegrity: (messageId: string) => Promise<boolean>;
  retryFailedMessage: (messageId: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<IMessage[]>([]);
  const [currentRecipient, setCurrentRecipient] = useState<{
    _id: string;
    name: string;
    username: string;
    avatar?: string;
    isTyping?: boolean;
    lastSeen?: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!currentUser) return;

    const apiUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8000';
    const isProduction = import.meta.env.PROD;
    
    // Only create new socket if it doesn't exist or is disconnected
    if (!socket || !socket.connected) {
      const newSocket = io(apiUrl, {
        path: '/socket.io',
        withCredentials: true,
        auth: {
          token: localStorage.getItem('token'),
          userId: currentUser.id,
          username: currentUser.username
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['websocket'],
        secure: isProduction,
        rejectUnauthorized: !isProduction
      });

      // Set up event listeners
      const onConnect = () => {
        console.log('Connected to WebSocket server');
        // Load conversations when connected
        loadConversations();
        
        // Emit user online status
        newSocket.emit('user-online', { 
          userId: currentUser.id,
          username: currentUser.username 
        });
      };

      const onDisconnect = (reason: string) => {
        console.log('Disconnected from WebSocket:', reason);
        if (reason === 'io server disconnect') {
          // The disconnection was initiated by the server, you need to reconnect manually
          newSocket.connect();
        }
      };

      const onReceiveMessage = (message: IMessage) => {
        console.log('Received message:', message);
        
        // Only add the message if it's from someone else (not from current user)
        if (message.sender._id !== currentUser.id) {
          // Update current conversation if it's the active one
          if (currentRecipient?._id === message.sender._id) {
            setCurrentConversation(prev => [...prev, { ...message, status: 'delivered' }]);
            // Mark as read if it's the current conversation
            markAsRead([message._id]);
          }
          
          // Update conversations list
          updateConversationList(message);
        } else {
          console.log('Ignoring own message from WebSocket');
        }
      };

      const onMessageRead = (data: { messageId: string, userId: string }) => {
        console.log('Message read:', data);
        setCurrentConversation(prev => 
          prev.map(msg => 
            msg._id === data.messageId ? { ...msg, read: true, status: 'read' } : msg
          )
        );
      };

      const onUserTyping = (data: { senderId: string, isTyping: boolean }) => {
        console.log('User typing:', data);
        if (currentRecipient?._id === data.senderId) {
          setCurrentRecipient(prev => prev ? { ...prev, isTyping: data.isTyping } : null);
        }
      };

      const onGetUsers = (users: Array<{ userId: string, username: string }>) => {
        console.log('Online users:', users);
        const onlineUsersMap = users.reduce((acc, user) => ({
          ...acc,
          [user.userId]: true
        }), {} as Record<string, boolean>);
        
        setOnlineUsers(onlineUsersMap);
      };

      // Add event listeners
      newSocket.on('connect', onConnect);
      newSocket.on('disconnect', onDisconnect);
      newSocket.on('receiveMessage', onReceiveMessage);
      newSocket.on('messageRead', onMessageRead);
      newSocket.on('userTyping', onUserTyping);
      newSocket.on('getUsers', onGetUsers);
      newSocket.on('online-users', onGetUsers);

      setSocket(newSocket);

      // Clean up on unmount
      return () => {
        newSocket.off('connect', onConnect);
        newSocket.off('disconnect', onDisconnect);
        newSocket.off('receiveMessage', onReceiveMessage);
        newSocket.off('messageRead', onMessageRead);
        newSocket.off('userTyping', onUserTyping);
        newSocket.off('getUsers', onGetUsers);
        newSocket.off('online-users', onGetUsers);
        
        if (!currentUser) {
          newSocket.disconnect();
        }
      };
    }

    // Join room when recipient changes
    if (socket && currentRecipient) {
      socket.emit('joinRoom', { 
        userId: currentUser.id, 
        recipientId: currentRecipient._id 
      });
    }

    return () => {
      // Don't disconnect when component unmounts, only when user changes or logs out
      if (socket && !currentUser) {
        socket.disconnect();
      }
    };
  }, [currentUser]); // Removed currentRecipient from dependencies

  const updateConversationList = (message: IMessage) => {
    setConversations(prev => {
      const otherUserId = message.sender._id === currentUser?.id 
        ? message.recipient._id 
        : message.sender._id;
      
      const existingConvIndex = prev.findIndex(c => c.user._id === otherUserId);
      
      if (existingConvIndex >= 0) {
        const updated = [...prev];
        // Ensure lastMessage is always a string
        const lastMessageContent = typeof message.content === 'string' 
          ? message.content 
          : JSON.stringify(message.content);
          
        updated[existingConvIndex] = {
          ...updated[existingConvIndex],
          lastMessage: lastMessageContent,
          unreadCount: message.sender._id !== currentUser?.id 
            ? updated[existingConvIndex].unreadCount + 1 
            : 0,
          updatedAt: new Date().toISOString(),
          lastMessageAt: message.createdAt
        };
        return updated.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
      
      // If no existing conversation, create a new one
      const newConversation: IConversation = {
        _id: `temp-${Date.now()}`,
        user: message.sender._id === currentUser?.id ? message.recipient : message.sender,
        lastMessage: message.content,
        unreadCount: message.sender._id !== currentUser?.id ? 1 : 0,
        updatedAt: new Date().toISOString(),
        lastMessageAt: message.createdAt
      };
      
      return [newConversation, ...prev];
    });
  };

  const loadConversations = useCallback(async () => {
    if (!currentUser) {
      console.log('No current user, skipping conversations load');
      return [];
    }
    
    try {
      setLoading(true);
      console.log('Fetching conversations from API...');
      
      // Add debug logging for auth token
      const token = localStorage.getItem('token');
      console.log('Auth token exists:', !!token);
      
      const response = await api.get('/messages/conversations/list');
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });
      
      // Handle different response formats
      let conversationsData = [];
      
      if (Array.isArray(response.data)) {
        conversationsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        conversationsData = response.data.data;
      } else if (response.data?.success && Array.isArray(response.data.data)) {
        conversationsData = response.data.data;
      } else {
        console.warn('Unexpected response format:', response.data);
      }
      
      console.log(`Processed ${conversationsData.length} conversations`);
      
      if (conversationsData.length === 0) {
        console.log('No conversations found. This might be normal if the user has no conversations yet.');
      }
      
      setConversations(conversationsData);
      return conversationsData;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load conversations';
      console.error('Error loading conversations:', errorMessage, err);
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentUser]);
const loadConversation = useCallback(async (userId: string) => {
  if (!currentUser) {
    console.error('No current user');
    return;
  }

  try {
    setLoading(true);
    console.log(`Loading conversation with user ID: ${userId}`);
    
    console.log('Making API calls for conversation with user ID:', userId);
    
    const [messagesResponse, userResponse] = await Promise.all([
      api.get(MESSAGES.GET_CONVERSATION(userId)),
      api.get(MESSAGES.GET_USER(userId))
    ]);
    
    console.log('Messages response:', messagesResponse.data);
    console.log('User response:', userResponse.data);
    
    // Set the messages
    const messages = messagesResponse.data.data || [];
    setCurrentConversation(messages);
    console.log(`Loaded ${messages.length} messages`);
    
    // Set the recipient
    const user = userResponse.data.data;
    if (user) {
      setCurrentRecipient({
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        isTyping: false
      });
      console.log('Set current recipient:', user.name);
    } else {
      console.error('No user data in response');
    }
  } catch (error) {
    console.error('Error in loadConversation:', error);
    setError('Failed to load conversation');
    throw error;
  } finally {
    setLoading(false);
  }
}, [currentUser]);

  const sendMessage = async (content: string, recipientId: string) => {
    if (!currentUser || !socket) return;
    
    const tempId = `temp-${Date.now()}`;
    const tempMessage: IMessage = {
      _id: tempId,
      sender: {
        _id: currentUser.id,
        name: currentUser.fullName || '',
        username: currentUser.username || '',
        avatar: currentUser.avatar
      },
      recipient: {
        _id: recipientId,
        name: currentRecipient?.name || '',
        username: currentRecipient?.username || '',
        avatar: currentRecipient?.avatar
      },
      content,
      read: false,
      status: 'sending',
      createdAt: new Date().toISOString()
    };
    
    // Add temporary message immediately for instant feedback
    setCurrentConversation(prev => [...prev, tempMessage]);
    
    try {
      const response = await api.post('/messages', {
        recipientId,
        content
      });
      
      console.log('Message sent successfully:', response.data);
      
      // Replace temporary message with server response
      const serverMessage = response.data.data || response.data;
      setCurrentConversation(prev => 
        prev.map(msg => 
          msg._id === tempId 
            ? { ...serverMessage, status: 'sent' as const }
            : msg
        )
      );
      
      // Update conversation list
      updateConversationList(serverMessage);
      
      return response.data;
    } catch (err: any) {
      // Update message status to failed
      setCurrentConversation(prev => 
        prev.map(msg => 
          msg._id === tempId 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
      
      setError(err.response?.data?.message || 'Failed to send message');
      throw err;
    }
  };
  
  const markAsRead = async (messageIds: string[]) => {
    if (!messageIds.length || !socket) return;
    
    try {
      await api.patch('/messages/mark-as-read', { messageIds });
      
      // Update local state
      setCurrentConversation(prev => 
        prev.map(msg => 
          messageIds.includes(msg._id) 
            ? { ...msg, read: true, status: 'read' as const }
            : msg
        )
      );
      
      // Emit read receipt
      const message = currentConversation.find(msg => msg._id === messageIds[0]);
      if (message) {
        socket.emit('markAsRead', {
          messageId: message._id,
          userId: message.sender._id
        });
      }
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };
  
  const setTyping = useCallback((isTyping: boolean) => {
    if (!socket || !currentRecipient || !currentUser) return;
    
    setIsTyping(isTyping);
    
    try {
      socket.emit('typing', {
        senderId: currentUser.id,
        senderUsername: currentUser.username,
        receiverUsername: currentRecipient.username,
        isTyping
      });
    } catch (err) {
      console.error('Error sending typing indicator:', err);
    }
  }, [socket, currentRecipient, currentUser]);
  
  const verifyMessageIntegrity = async (messageId: string): Promise<boolean> => {
    try {
      const response = await api.get(`/messages/${messageId}/verify`);
      return response.data.isValid;
    } catch (err) {
      console.error('Failed to verify message integrity:', err);
      return false;
    }
  };
  
  const retryFailedMessage = async (messageId: string) => {
    const message = currentConversation.find(msg => msg._id === messageId);
    if (!message) return;
    
    try {
      // Update status to sending
      setCurrentConversation(prev => 
        prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, status: 'sending' }
            : msg
        )
      );
      
      // Resend the message
      const response = await api.post('/messages', {
        recipientId: message.recipient._id,
        content: message.content
      });
      
      // Update with new message from server
      setCurrentConversation(prev => 
        prev.map(msg => 
          msg._id === messageId 
            ? { ...response.data, status: 'sent' }
            : msg
        )
      );
      
      // Update conversation list
      updateConversationList(response.data);
      
      return response.data;
    } catch (err) {
      // Update status back to failed
      setCurrentConversation(prev => 
        prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
      throw err;
    }
  };

  // Load conversations when the component mounts or user changes
  useEffect(() => {
    if (currentUser) {
      loadConversations();
      
      // Set up periodic refresh of online status
      const interval = setInterval(() => {
        if (socket?.connected) {
          loadConversations();
        }
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [currentUser, loadConversations, socket]);

  return (
    <MessageContext.Provider
      value={{
        // State
        conversations,
        currentConversation,
        currentRecipient,
        loading,
        error,
        isTyping,
        onlineUsers,
        
        // Methods
        sendMessage,
        loadConversation,
        loadConversations,
        markAsRead,
        setTyping,
        verifyMessageIntegrity,
        retryFailedMessage,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};
