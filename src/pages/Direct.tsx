import { Box, Typography, Paper, TextField, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, ListItemButton } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

type Message = {
  id: string;
  user: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
};

const Direct = () => {
  const conversations: Message[] = [
    {
      id: '1',
      user: 'johndoe',
      avatar: '',
      lastMessage: 'Hey, how are you doing?',
      time: '2h',
      unread: true,
    },
    // Add more conversations
  ];

  return (
    <Box display="flex" height="calc(100vh - 60px)">
      {/* Sidebar */}
      <Paper elevation={0} sx={{ width: 350, borderRight: '1px solid #dbdbdb', height: '100%' }}>
        <Box p={2} borderBottom="1px solid #dbdbdb">
          <Typography variant="h6">Messages</Typography>
        </Box>
        
        {/* Search */}
        <Box p={2}>
          <TextField
            fullWidth
            placeholder="Search"
            size="small"
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
          />
        </Box>

        {/* Conversations */}
        <List sx={{ overflowY: 'auto', maxHeight: 'calc(100% - 120px)' }}>
          {conversations.map((conversation) => (
            <div key={conversation.id}>
              <ListItem disablePadding>
                <ListItemButton>
                <ListItemAvatar>
                  <Avatar src={conversation.avatar} alt={conversation.user} />
                </ListItemAvatar>
                <ListItemText
                  primary={conversation.user}
                  secondary={conversation.lastMessage}
                  primaryTypographyProps={{
                    fontWeight: conversation.unread ? 'bold' : 'normal',
                  }}
                  secondaryTypographyProps={{
                    color: conversation.unread ? 'text.primary' : 'text.secondary',
                    fontWeight: conversation.unread ? 'medium' : 'normal',
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {conversation.time}
                </Typography>
                </ListItemButton>
              </ListItem>
              <Divider variant="inset" component="li" />
            </div>
          ))}
        </List>
      </Paper>

      {/* Chat Area */}
      <Box flex={1} display="flex" flexDirection="column" height="100%">
        <Box p={2} borderBottom="1px solid #dbdbdb" textAlign="center">
          <Typography variant="subtitle1" fontWeight="bold">
            Select a conversation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start a new conversation or select an existing one
          </Typography>
        </Box>
        
        {/* Empty state */}
        <Box 
          flex={1} 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center"
          color="text.secondary"
        >
          <Box 
            width={96} 
            height={96} 
            borderRadius="50%" 
            bgcolor="#f0f0f0" 
            mb={2}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <span style={{ fontSize: '40px' }}>💬</span>
          </Box>
          <Typography variant="h6" gutterBottom>
            Your Messages
          </Typography>
          <Typography variant="body2" textAlign="center" maxWidth={300} mb={2}>
            Send private photos and messages to a friend or group
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Direct;
