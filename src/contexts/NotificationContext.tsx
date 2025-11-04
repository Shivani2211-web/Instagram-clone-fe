import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

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
  const { currentUser } = useAuth();

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (currentUser?.id) {
      const savedNotifications = localStorage.getItem(`notifications_${currentUser.id}`);
      if (savedNotifications) {
        try {
          const parsed = JSON.parse(savedNotifications);
          if (Array.isArray(parsed)) {
            setNotifications(parsed);
          }
        } catch (error) {
          console.error('Error parsing saved notifications:', error);
        }
      }
    }
  }, [currentUser]);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem(`notifications_${currentUser.id}`, JSON.stringify(notifications));
    }
  }, [notifications, currentUser]);

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

  const markAsRead = (id: string | number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: 'read' as const } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: 'read' as const }))
    );
  };

  const unreadCount = notifications.filter(n => n.read === 'unread').length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
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
