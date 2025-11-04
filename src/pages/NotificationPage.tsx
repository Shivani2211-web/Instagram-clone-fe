import React from 'react';
import NotificationsList from '../components/notification/NotificationList';
import { Box, Typography } from '@mui/material';

const NotificationsPage: React.FC = () => {
  return (
    <Box sx={{maxWidth:'1200px',mx:'auto',p:4,color:"white"}}>
      <Typography variant="h4" sx={{mb:4}} >Notifications</Typography>
      <NotificationsList />
    </Box>
  );
};

export default NotificationsPage;