import React, { useState, useEffect } from 'react';
import { getNotifications, markAsRead, deleteNotifications } from '../../services/notificationService';
import NotificationItem from './NotificationItem';
import { Box, Button, Typography } from '@mui/material';

const NotificationsList: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const data = await getNotifications(page);
      setNotifications(prev => [...prev, ...data.data]);
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [page]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead([id]);
      setNotifications(prev => 
        prev.map(n => 
          n._id === id ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotifications([id]);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <Box sx={{maxWidth:'1200px',mx:'auto',p:4}} className="max-w-2xl mx-auto bg-white rounded-lg shadow">
      <Box className="p-4 border-b border-gray-200">
        <Typography variant="h6" className="text-xl font-semibold text-white-500">Notifications</Typography>
      </Box>
      
      <Box className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {notifications.map(notification => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        ))}
        
        {loading && (
          <Box className="p-4 text-center text-white-500"><Typography variant="body1">Loading...</Typography></Box>
        )}
        
        {!loading && hasMore && (
          <Button
            onClick={() => setPage(p => p + 1)}
            className="w-full p-3 text-center text-white-500 hover:bg-gray-50"
          >
            Load more
          </Button>
        )}
        
        {!loading && notifications.length === 0 && (
          <Box><Typography variant="body1">No notifications yet</Typography></Box>
        )}
      </Box>
    </Box>
  );
};

export default NotificationsList;