import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getNotifications, getUnreadCount, markAsRead as markAsReadApi } from '../services/notificationService';

// Define the notification type
type NotificationType = 'like' | 'follow' | 'comment' | 'mention' | 'message' | 'follow_request' | 'post_like' | 'post_comment' | 'post_mention' | 'post_shared';

interface ApiNotification {
  _id: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  sender?: {
    _id: string;
    username: string;
    avatar?: string;
  };
  postId?: string;
  commentId?: string;
  comment?: string;
}

export interface Notification {
  id: string;
  text: string;
  time: string;
  read: 'read' | 'unread';
  type?: 'like' | 'follow' | 'comment' | 'message';
  userId?: string;
  postId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'time'>) => void;
  markAsRead: (id: string | number) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCountState, setUnreadCountState] = useState(0);
  const { currentUser } = useAuth();

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const [notificationsRes, unreadCountRes] = await Promise.all([
        getNotifications({ unread: false }),
        getUnreadCount()
      ]);
      
      if (notificationsRes.data) {
        setNotifications(notificationsRes.data.map((n: any) => ({
          id: n._id,
          text: getNotificationText(n),
          time: n.createdAt,
          read: n.read ? 'read' : 'unread',
          type: n.type,
          userId: n.sender?._id,
          postId: n.postId
        })));
      }
      
      setUnreadCountState(unreadCountRes);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [currentUser]);

  // Helper function to generate notification text based on type
  const getNotificationText = (notification: any): string => {
    const user = notification.sender?.username || 'Someone';
    const type = notification.type;
    
    switch (type) {
      case 'follow':
        return `${user} started following you`;
      case 'like':
        return `${user} liked your post`;
      case 'comment':
        return `${user} commented on your post`;
      case 'mention':
        return `${user} mentioned you in a comment`;
      case 'follow_request':
        return `${user} wants to follow you`;
      default:
        return 'New notification';
    }
  };

  // Load notifications when user logs in
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      // Set up polling to check for new notifications
      const interval = setInterval(fetchNotifications, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [currentUser, fetchNotifications]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    return false;
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'read' | 'time'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: 'unread' as const,
      time: new Date().toISOString(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show desktop notification if the page is not focused and notifications are supported
    if (document.visibilityState !== 'visible' && 'Notification' in window) {
      const hasPermission = await requestNotificationPermission();
      if (hasPermission) {
        try {
          const notification = new Notification('New Notification', {
            body: newNotification.text,
            icon: '/logo192.png'
          });
          
          // Handle notification click
          notification.onclick = () => {
            window.focus();
            // You can add navigation logic here if needed
          };
        } catch (error) {
          console.error('Error showing notification:', error);
        }
      }
    }
  };

  const markAsRead = async (id: string | number) => {
    try {
      await markAsReadApi([id.toString()]);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: 'read' as const } : notif
        )
      );
      setUnreadCountState((prev: number) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => n.read === 'unread')
        .map(n => n.id);
      
      if (unreadIds.length > 0) {
        await markAsReadApi(unreadIds);
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read: 'read' as const }))
        );
        setUnreadCountState(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount: unreadCountState,
        addNotification,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const useUnreadNotifications = () => {
  const { notifications } = useNotifications();
  return notifications.filter(n => n.read === 'unread');
};
