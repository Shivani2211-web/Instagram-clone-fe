import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Avatar, 
  Paper, 
  Badge, 
  CircularProgress,
  styled,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Card,
  CardMedia,
  CardContent
} from '@mui/material';
import {  } from '@mui/material/Grid';
import { 
  Send as SendIcon, 
  Done as SentIcon, 
  DoneAll as ReadIcon, 
  Error as ErrorIcon, 
  Autorenew as SendingIcon 
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { IMessage } from '../../contexts/MessageContext';

interface MessageBubbleProps {
  isCurrentUser: boolean;
}

const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 64px)',
  backgroundColor: theme.palette.background.default,
  borderLeft: `1px solid ${theme.palette.divider}`,
  position: 'relative',
}));

const MessageBubble = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isCurrentUser',
})<MessageBubbleProps>(({ theme, isCurrentUser }) => ({
  maxWidth: '70%',
  padding: theme.spacing(1.5, 2),
  backgroundColor: isCurrentUser 
    ? theme.palette.primary.main 
    : theme.palette.background.paper,
  color: isCurrentUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  borderRadius: '18px',
  borderTopLeftRadius: isCurrentUser ? '18px' : '4px',
  borderTopRightRadius: isCurrentUser ? '4px' : '18px',
  margin: theme.spacing(0.5, 0),
  wordBreak: 'break-word',
  position: 'relative',
  boxShadow: theme.shadows[1],
  '&:hover': {
    boxShadow: theme.shadows[2]
  },
  alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
  transition: 'all 0.2s ease-in-out',
}));

const TimeStamp = styled(Typography)(({ theme }) => ({
  fontSize: '0.65rem',
  color: theme.palette.text.secondary,
  textAlign: 'right',
  marginTop: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '4px',
  opacity: 0.8,
  fontFeatureSettings: '"tnum"',
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  position: 'sticky',
  top: 0,
  zIndex: 10,
}));

const MessagesContainer = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '3px',
  },
});

const MessageInputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const MessageInput = styled(TextField)({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    borderRadius: '24px',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'transparent',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1px',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '10px 16px',
  },
});

const SendButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
}));

const TypingIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 12px',
  backgroundColor: theme.palette.action.hover,
  borderRadius: '12px',
  alignSelf: 'flex-start',
  marginLeft: '8px',
  marginBottom: '4px',
  '& .dot': {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: theme.palette.text.secondary,
    animation: 'bounce 1.4s infinite ease-in-out both',
    '&:nth-child(1)': { animationDelay: '-0.32s' },
    '&:nth-child(2)': { animationDelay: '-0.16s' },
  },
  '@keyframes bounce': {
    '0%, 80%, 100%': { transform: 'scale(0.6)' },
    '40%': { transform: 'scale(1.0)' },
  },
}));

interface ChatWindowProps {
  recipientId: string;
  messages: IMessage[];
  currentUserId: string;
  onSendMessage: (content: string) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  recipient: {
    _id: string;
    name: string;
    username: string;
    profilePicture?: string;
    isTyping?: boolean;
    lastSeen?: string;
    followers?: number;
  } | null;
  loading?: boolean;
  error?: string | null;
  onRetryMessage?: (messageId: string) => Promise<void>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  currentUserId,
  onSendMessage,
  onTyping,
  recipient,
  loading = false,
  onRetryMessage,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('ChatWindow render:', {
      recipient,
      messagesCount: messages.length,
      loading,
      currentUserId,
      messages: messages.map(m => ({
        id: m._id,
        senderId: m.sender._id,
        senderIdType: typeof m.sender._id,
        currentUserIdType: typeof currentUserId,
        isMatch: m.sender._id === currentUserId,
        isMatchString: String(m.sender._id) === String(currentUserId)
      }))
    });
  }, [recipient, messages, loading, currentUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const messageToSend = message;
    setMessage('');
    
    try {
      await onSendMessage(messageToSend);
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessage(messageToSend); // Restore message if sending fails
    }
  };

  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    onTyping(true);
    
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  const getMessageStatus = (msg: IMessage) => {
    if (msg.status === 'sending') return <SendingIcon fontSize="small" color="disabled" />;
    if (msg.status === 'failed') return <ErrorIcon color="error" fontSize="small" />;
    if (msg.read) return <ReadIcon color="primary" fontSize="small" />;
    return <SentIcon color="disabled" fontSize="small" />;
  };

  const handleProfileClick = async () => {
    if (!recipient) return;
    
    setProfileOpen(true);
    setProfileLoading(true);
    
    try {
      // Fetch user profile data
      const response = await fetch(`/api/v1/users/${recipient.username}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      
      setUserProfile(data.data);
      
      // Check if current user is following this user
      const followCheck = await fetch(`/api/v1/users/${recipient._id}/follow-status`);
      if (followCheck.ok) {
        const followData = await followCheck.json();
        setIsFollowing(followData.isFollowing);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!recipient) return;
    
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/v1/users/${recipient._id}/follow`, {
        method,
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
        // Update followers count
        setUserProfile((prev: any) => ({
          ...prev,
          followers: isFollowing ? prev.followers - 1 : prev.followers + 1
        }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (!recipient) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        height="100%" 
        p={3}
        textAlign="center"
        bgcolor="#fff"
      >
        <Typography variant="h6" color="textSecondary">
          Select a conversation to start chatting
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          Loading recipient data...
        </Typography>
      </Box>
    );
  }

  return (
    <ChatContainer sx={{ flex: 1 }}>
      {/* Header */}
      <ChatHeader sx={{ flexShrink: 0, cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } }} onClick={handleProfileClick}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
          color="success"
          invisible={!recipient.lastSeen || Date.now() - new Date(recipient.lastSeen).getTime() > 300000}
        >
          <Avatar 
            src={recipient.profilePicture} 
            alt={recipient.name}
            sx={{ width: 40, height: 40, mr: 2 }}
          />
        </Badge>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {recipient.name}
          </Typography>
          {recipient?.isTyping && (
            <TypingIndicator>
              <Box className="dot" />
              <Box className="dot" />
              <Box className="dot" />
            </TypingIndicator>
          )}
        </Box>
      </ChatHeader>

      {/* Profile Dialog */}
      <Dialog 
        open={profileOpen} 
        onClose={() => setProfileOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: '1px solid #eee' }}>
          <Box display="flex" alignItems="center">
            <Avatar 
              src={userProfile?.profilePicture} 
              alt={userProfile?.name}
              sx={{ width: 60, height: 60, mr: 2 }}
            />
            <Box>
              <Typography variant="h6">{userProfile?.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                @{userProfile?.username}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Tabs 
            value={tabValue} 
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            <Tab label="Profile" />
            <Tab label="Posts" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box mb={3}>
              <Typography variant="body1" paragraph>
                {userProfile?.bio || 'No bio available'}
              </Typography>
              
              <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2} mb={3}>
                <Box textAlign="center">
                  <Typography variant="h6">{userProfile?.posts?.length || 0}</Typography>
                  <Typography variant="body2" color="textSecondary">Posts</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6">{userProfile?.followers || 0}</Typography>
                  <Typography variant="body2" color="textSecondary">Followers</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6">{userProfile?.following || 0}</Typography>
                  <Typography variant="body2" color="textSecondary">Following</Typography>
                </Box>
              </Box>

              {userProfile?.website && (
                <Box mb={2}>
                  <Typography variant="subtitle2" color="primary">
                    <a 
                      href={userProfile.website.startsWith('http') ? userProfile.website : `https://${userProfile.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {userProfile.website}
                    </a>
                  </Typography>
                </Box>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {profileLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : userProfile?.posts?.length > 0 ? (
              <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
                {userProfile.posts.map((post: any) => (
                  <Box key={post._id}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="200"
                        image={post.imageUrl}
                        alt={post.caption || 'Post'}
                      />
                      {post.caption && (
                        <CardContent>
                          <Typography variant="body2" color="textSecondary">
                            {post.caption.length > 100 
                              ? `${post.caption.substring(0, 100)}...` 
                              : post.caption}
                          </Typography>
                        </CardContent>
                      )}
                    </Card>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box textAlign="center" p={4}>
                <Typography variant="body1" color="textSecondary">
                  No posts yet
                </Typography>
              </Box>
            )}
          </TabPanel>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Button 
            variant={isFollowing ? 'outlined' : 'contained'}
            color="primary"
            onClick={handleFollowToggle}
            fullWidth
            disabled={profileLoading}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Messages */}
      <MessagesContainer sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', bgcolor: '#fafafa', backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)', backgroundSize: '20px 20px', p: 2, display: 'flex', flexDirection: 'column' }}>
        {loading && messages.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            height="100%"
            textAlign="center"
            p={3}
          >
            <Typography variant="h6" color="textSecondary">
              No messages yet
            </Typography>
            <Typography variant="body2" color="textSecondary" mt={1}>
              Send a message to start the conversation
            </Typography>
          </Box>
        ) : (
          <>
            {messages.map((msg) => {
              const isCurrentUser = String(msg.sender._id) === String(currentUserId);
              return (
              <Box 
                key={msg._id} 
                display="flex"
                flexDirection="column"
                alignItems={isCurrentUser ? 'flex-end' : 'flex-start'}
                width="100%"
                mb={1}
                px={2}
              >
                <MessageBubble 
                  elevation={0}
                  isCurrentUser={isCurrentUser}
                  onClick={() => msg.status === 'failed' && onRetryMessage?.(msg._id)}
                  sx={{
                    cursor: msg.status === 'failed' ? 'pointer' : 'default',
                    opacity: msg.status === 'sending' ? 0.7 : 1,
                  }}
                >
                  <Typography variant="body1">{msg.content}</Typography>
                  <TimeStamp>
                    {format(new Date(msg.createdAt), 'h:mm a')}
                    {isCurrentUser && (
                      <Box ml={0.5} display="flex" alignItems="center">
                        {getMessageStatus(msg)}
                      </Box>
                    )}
                  </TimeStamp>
                </MessageBubble>
              </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      
      </MessagesContainer>

      {/* Message Input */}
      <MessageInputContainer>
        <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
          <MessageInput
            fullWidth
            variant="outlined"
            placeholder="Message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            multiline
            maxRows={4}
          />
          <SendButton
            type="submit"
            disabled={!message.trim()}
            sx={{ ml: 1 }}
          >
            <SendIcon />
          </SendButton>
        </Box>
      </MessageInputContainer>
    </ChatContainer>
  );
};

export default ChatWindow;
