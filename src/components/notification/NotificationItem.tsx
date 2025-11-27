import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Avatar, 
  Box, 
  IconButton, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Typography, 
  useTheme,
  ListItemSecondaryAction,
  Paper
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface NotificationItemProps {
  id: string;
  text: string;
  time: string;
  read: boolean;
  avatar?: string;
  onMarkAsRead: () => void;
  onDelete: () => void;
  comment?: string | { text: string };
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  text,
  time,
  read,
  avatar,
  comment,
  onMarkAsRead,
  onDelete,
}) => {
  const theme = useTheme();

  const handleClick = () => {
    if (!read) {
      onMarkAsRead();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <Paper 
      elevation={0}
      sx={{
        mb: 1,
        backgroundColor: 'background.paper',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: 0
      }}
      onClick={handleClick}
    >
      <Box sx={{ position: 'relative' }}>
        {!read && (
          <Box 
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
            }}
          />
        )}
        <ListItem 
          alignItems="flex-start"
          sx={{
            pl: !read ? 4 : 2,
            py: 1.5,
            position: 'relative',
          }}
        >
          <ListItemAvatar>
            <Avatar 
              src={avatar || '/default-avatar.png'}
              alt=""
              sx={{ width: 48, height: 48 }}
            />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography
                variant="body1"
                color="text.primary"
                sx={{ 
                  fontWeight: read ? 'normal' : 'medium',
                  pr: 4
                }}
              >
                {text}
              </Typography>
            }
            secondary={
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                >
                  {formatDistanceToNow(new Date(time), { addSuffix: true })}
                </Typography>
                {comment && (
                  <Typography
                    component="div"
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      pl: 2,
                      borderLeft: `2px solid ${theme.palette.divider}`,
                      fontStyle: 'italic',
                    }}
                  >
                    {typeof comment === 'string' ? comment : comment.text}
                  </Typography>
                )}
              </React.Fragment>
            }
          />
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={handleDelete}
              size="small"
              sx={{
                '&:hover': {
                  color: 'error.main',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </Box>
    </Paper>
  );
};

export default NotificationItem;