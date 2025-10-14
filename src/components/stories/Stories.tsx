import { Box, Avatar, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StoryAvatar = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  border: '2px solid transparent',
  background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
  '& > *': {
    border: '2px solid white',
    borderRadius: '50%'
  },
  '&.viewed': {
    background: theme.palette.grey[300],
    '& > *': {
      opacity: 0.7
    }
  }
}));

interface Story {
  id: string;
  username: string;
  avatar: string;
  hasUnseenStory: boolean;
}

const Stories = () => {
  // Mock data - replace with real data
  const stories: Story[] = [
    { id: '1', username: 'your_story', avatar: '', hasUnseenStory: true },
    { id: '2', username: 'user1', avatar: '', hasUnseenStory: true },
    { id: '3', username: 'traveler', avatar: '', hasUnseenStory: true },
    { id: '4', username: 'foodie', avatar: '', hasUnseenStory: false },
    { id: '5', username: 'photographer', avatar: '', hasUnseenStory: true },
    { id: '6', username: 'artist', avatar: '', hasUnseenStory: false },
    { id: '7', username: 'explorer', avatar: '', hasUnseenStory: true },
  ];

  return (
    <Box 
      sx={{
        display: 'flex',
        overflowX: 'auto',
        gap: 2,
        p: 2,
        bgcolor: 'background.paper',
        border: '1px solid #dbdbdb',
        borderRadius: 2,
        mb: 3,
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}
    >
      {stories.map((story) => (
        <Box 
          key={story.id} 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 70,
            cursor: 'pointer'
          }}
        >
          <StoryAvatar 
            className={!story.hasUnseenStory ? 'viewed' : ''}
            src={story.avatar}
            alt={story.username}
          >
            {story.username.charAt(0).toUpperCase()}
          </StoryAvatar>
          <Typography 
            variant="caption" 
            sx={{ 
              mt: 1, 
              textAlign: 'center',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              width: '100%',
              fontSize: '0.7rem'
            }}
          >
            {story.username === 'your_story' ? 'Your Story' : story.username}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default Stories;
