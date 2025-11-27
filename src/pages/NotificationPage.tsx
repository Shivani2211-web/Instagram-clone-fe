import React from 'react';
import NotificationsList from '../components/notification/NotificationList';
import { Box, Typography, Container } from '@mui/material';

const NotificationsPage: React.FC = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.paper',
      py: 4
    }}>
      <Container maxWidth="md">
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 4,
            color: 'text.primary',
            fontWeight: 600
          }}
        >
          Notifications
        </Typography>
        <NotificationsList />
      </Container>
    </Box>
  );
};

export default NotificationsPage;