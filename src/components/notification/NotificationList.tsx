import React, { useState, useEffect, useCallback } from 'react';
import { 
  getNotifications, 
  markAsRead, 
  deleteNotifications 
} from '../../services/notificationService';
import NotificationItem from './NotificationItem';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  List, 
  Divider,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon, 
  Check as CheckIcon, 
  Delete as DeleteIcon, 
  Refresh as RefreshIcon 
} from '@mui/icons-material';

interface Notification {
  _id: string;
  type: string;
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

const NotificationsList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const limit = 10;
  const open = Boolean(anchorEl);

  // ---- MENU HANDLERS ----
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRefresh = () => {
    setPage(1);
    setNotifications([]);
    setHasMore(true);
    setRefreshing(true);
    handleMenuClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
      if (unreadIds.length > 0) {
        await markAsRead(unreadIds);
        setNotifications(prev =>
          prev.map(n => (unreadIds.includes(n._id) ? { ...n, read: true } : n))
        );
      }
      handleMenuClose();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const ids = notifications.map(n => n._id);
      await deleteNotifications(ids);
      setNotifications([]);
      setPage(1);
      setHasMore(true);
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  // ---- LOAD NOTIFICATIONS ----
  const loadNotifications = useCallback(async () => {
    if ((loading && !refreshing) || !hasMore) return;

    setLoading(true);
    try {
      const response = await getNotifications({
        page: refreshing ? 1 : page,
        limit
      });

      const { data, pages } = response;

      setNotifications(prev =>
        refreshing ? data : [...prev, ...data]
      );

      setHasMore(refreshing ? data.length === limit : page < pages);

      if (refreshing) {
        setPage(1);
        setRefreshing(false);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, loading, hasMore, refreshing]);

  useEffect(() => {
    loadNotifications();
  }, [page, loadNotifications]);

  // ---- INDIVIDUAL ITEM ACTIONS ----
  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead([id]);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
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

  // ---- NOTIFICATION TEXT ----
  const getNotificationText = (notification: Notification): string => {
    const user = notification.sender?.username || 'Someone';
    switch (notification.type) {
      case 'follow':
        return `${user} started following you`;
      case 'like':
      case 'post_like':
        return `${user} liked your post`;
      case 'comment':
      case 'post_comment':
        return `${user} commented on your post`;
      case 'mention':
      case 'post_mention':
        return `${user} mentioned you in a comment`;
      case 'follow_request':
        return `${user} wants to follow you`;
      case 'post_shared':
        return `${user} shared your post`;
      default:
        return 'New notification';
    }
  };

  // ---- EMPTY STATE ----
  if (notifications.length === 0 && !loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>No notifications yet</Typography>
      </Box>
    );
  }

  // ---- MAIN RENDER ----
  return (
    <Paper sx={{ 
      width: '100%', 
      maxWidth: 600, 
      mx: 'auto', 
      my: 2,
      bgcolor: 'background.paper',
      boxShadow: 'none',
      border: '1px solid',
      borderColor: 'divider'
    }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" component="h2">
          Notifications
        </Typography>

        <Box>
          <Tooltip title="More options">
            <IconButton
              aria-label="more"
              aria-controls="notification-menu"
              aria-haspopup="true"
              onClick={handleMenuClick}
              size="small"
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          <Menu
            id="notification-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleRefresh}>
              <ListItemIcon>
                <RefreshIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Refresh</ListItemText>
            </MenuItem>

            <MenuItem onClick={handleMarkAllAsRead}>
              <ListItemIcon>
                <CheckIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Mark all as read</ListItemText>
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleDeleteAll}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ color: 'error' }}
              >
                Clear all
              </ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* List */}
      <List sx={{ 
        maxHeight: '70vh', 
        overflow: 'auto',
        bgcolor: 'background.paper'
      }}>
        {notifications.map((notification) => (
          <React.Fragment key={notification._id}>
            <NotificationItem
              id={notification._id}
              text={getNotificationText(notification)}
              time={notification.createdAt}
              read={notification.read}
              onMarkAsRead={() => handleMarkAsRead(notification._id)}
              onDelete={() => handleDelete(notification._id)}
              avatar={notification.sender?.avatar}
              comment={notification.comment}
            />
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {hasMore && !loading && notifications.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={loading}
              sx={{ width: '100%', maxWidth: 200 }}
            >
              Load More
            </Button>
          </Box>
        )}
      </List>
    </Paper>
  );
};

export default NotificationsList;
