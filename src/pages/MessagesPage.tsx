import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemButton,
  Avatar,
  ListItemText,
  Divider,
  Paper,
  InputAdornment,
  IconButton,
  Badge,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useMessages, type IConversation } from '../contexts/MessageContext';
import { ChatWindow } from '../components/chat';

const MessagesPage = () => {
  const { userId } = useParams<{ userId?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(false);

  const {
    conversations = [],
    currentConversation = [],
    currentRecipient,
    loading,
    error: contextError,
    sendMessage,
    loadConversation,
    markAsRead,
    setTyping,
    retryFailedMessage,
  } = useMessages();

  useEffect(() => {
    if (contextError) {
      setError(contextError);
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [contextError]);

  useEffect(() => {
    console.log('useEffect triggered with userId:', userId);
    if (userId) {
      console.log('Loading conversation for user ID:', userId);
      setIsPageLoading(true);
      loadConversation(userId)
        .then(() => {
          console.log('Successfully loaded conversation for user:', userId);
        })
        .catch((err) => {
          console.error('Error in loadConversation:', {
            error: err,
            response: err.response?.data,
            status: err.response?.status,
            headers: err.response?.headers
          });
          setError(`Failed to load conversation: ${err.message || 'Unknown error'}`);
        })
        .finally(() => {
          console.log('Finished loading attempt for user:', userId);
          setIsPageLoading(false);
        });
    }
  }, [userId, loadConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation]);

  useEffect(() => {
    if (currentConversation.length > 0 && userId && markAsRead) {
      const unread = currentConversation
        .filter((msg) => !msg.read && msg.sender._id !== currentUser?.id)
        .map((msg) => msg._id);
      if (unread.length) markAsRead(unread).catch(console.error);
    }
  }, [currentConversation, userId, currentUser, markAsRead]);

  // Removed handleSendMessage as it's now handled by ChatWindow

  // Removed handleTyping as it's now handled by ChatWindow

  // Removed handleRetryMessage as it's now handled by ChatWindow

  const handleConversationClick = useCallback(
    (conv: IConversation) => {
      if (conv.user?._id) {
        setError(null);
        const newPath = `/messages/${conv.user._id}`;
        navigate(newPath, { 
          replace: true,
          state: { from: 'conversation_click' }
        });
      }
    },
    [navigate]
  );

  // Removed renderStatus as it's now handled by ChatWindow

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isPageLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Sidebar - Only show on desktop or when no conversation is selected on mobile */}
      {(!isMobile || !userId) && (
        <Box
          sx={{
            width: { xs: '100%', sm: 350 },
            borderRight: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#fff',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <TextField
              fullWidth
              placeholder="Search"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: 3, bgcolor: '#f5f5f5' },
              }}
            />
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <List>
              {conversations.map((conv: IConversation) => (
                <React.Fragment key={conv._id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={currentRecipient?._id === conv.user._id}
                      onClick={() => handleConversationClick(conv)}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: 2,
                        '&.Mui-selected': { bgcolor: '#f0f0f0' },
                      }}
                    >
                      <Badge
                        color="primary"
                        variant="dot"
                        invisible={!conv.unreadCount}
                        overlap="circular"
                      >
                        <Avatar src={conv.user.avatar} sx={{ mr: 2 }} />
                      </Badge>
                      <ListItemText
                        primary={
                          <Typography fontWeight={600} noWrap>
                            {conv.user.name}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                            sx={{ fontSize: 13 }}
                          >
                            {typeof conv.lastMessage === 'object' ? 
                              (conv.lastMessage as any)?.content || 'New message' : 
                              conv.lastMessage || 'No messages yet'}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Box>
          <IconButton
            onClick={() => navigate('/messages')}
            sx={{ mr: 1, display: { sm: 'none' } }}
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton size="small">
            {/* More options menu can be added here */}
          </IconButton>
        </Box>
      )}

      {/* Chat Window */}
      {userId ? (
        <ChatWindow
          recipientId={userId}
          messages={currentConversation}
          currentUserId={currentUser?.id || ''}
          onSendMessage={async (content) => {
            if (userId) {
              await sendMessage(content, userId);
            }
          }}
          onTyping={(isTyping) => {
            if (userId) {
              setTyping(isTyping, userId);
            }
          }}
          recipient={currentRecipient ? {
            ...currentRecipient,
            isTyping: currentRecipient.isTyping || false,
          } : null}
          loading={loading}
          error={error}
          onRetryMessage={retryFailedMessage}
        />
      ) : (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            bgcolor: '#fafafa',
          }}
        >
          <Paper elevation={0} sx={{ p: 5, borderRadius: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: '#f0f2f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <SendIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
            </Box>
            <Box>
              <Typography variant="h6" color="textSecondary">
                Select a conversation to start messaging
              </Typography>
              <Typography variant="body2" color="textSecondary" mt={2}>
                Choose an existing conversation or start a new one
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MessagesPage;
