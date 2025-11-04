import { Box, Avatar, Typography, useTheme, Paper, CircularProgress, IconButton } from "@mui/material";
import { useEffect, useState } from 'react';
import { useStories } from '../../hooks/api/useStories';
import StoryViewer from './StoryViewer';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import CreateStory from './CreateStory';
import { storiesAPI } from '../../api/endpoints';

const Stories = () => {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [stories, setStories] = useState<any[]>([]);
  

  if (stories.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  const handleStoryClick = (storyId: string) => {
    setSelectedStoryId(storyId);
  };

  const handleCloseViewer = () => {
    setSelectedStoryId(null);
  };

  const handleCreateStory = () => {
    setIsCreatingStory(true);
  };

  const handleCloseCreateStory = () => {
    setIsCreatingStory(false);
    // Refresh stories after creating a new one
    // You might want to implement a refetch function in useStories
  };
  const refreshStories = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser?._id || currentUser?.id;
  
  if (!currentUserId) {
    console.error('No current user found');
    return;
  }

  storiesAPI.getFollowingStories().then((response) => {
    console.log('User stories response:', response);
    setStories(response);
  }).catch((error) => {
    console.error('Error fetching user stories:', error);
  }); 
}
useEffect(() => {
  if (currentUser) {
    refreshStories();
  }
}, [currentUser, refreshStories]);



  return (
    <>
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          overflowX: "auto",
          padding: "12px 16px",
          borderRadius: 3,
          backgroundColor: theme.palette.mode === "dark" ? "#121212" : "#fff",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {/* Create Story Button */}
        {currentUser && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: "70px",
            }}
          >
            <Box
              sx={{
                position: 'relative',
                p: '3px',
                borderRadius: '50%',
                background: theme.palette.mode === 'dark' ? '#333' : '#f0f0f0',
              }}
            >
              <Avatar
                src={currentUser.avatar}
                alt={currentUser.username}
                sx={{
                  width: 60,
                  height: 60,
                  border: "2px solid white",
                  cursor: 'pointer',
                  opacity: 0.8,
                  '&:hover': {
                    opacity: 1,
                  },
                }}
              />
              <IconButton
                onClick={handleCreateStory}
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  width: 24,
                  height: 24,
                }}
              >
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
            <Typography
              variant="caption"
              sx={{
                mt: 0.5,
                fontSize: "0.75rem",
                color: theme.palette.text.secondary,
                maxWidth: '70px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Your Story
            </Typography>
          </Box>
        )}

        {stories.length > 0 ? (
        stories.map((story) => (
          <Box
            key={story.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              minWidth: "70px",
            }}
          >
            <Box
              sx={{
                background: story.isViewed 
                  ? theme.palette.grey[400] 
                  : "linear-gradient(45deg, #f58529, #dd2a7b, #8134af, #515bd4)",
                p: "3px",
                borderRadius: "50%",
                opacity: story.isViewed ? 0.7 : 1,
              }}
            >
              <Avatar
                src={story.userAvatar || story.image}
                alt={story.username}
                sx={{
                  width: 60,
                  height: 60,
                  border: "2px solid white",
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
                onClick={() => handleStoryClick(story.id)}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{
                mt: 0.5,
                fontSize: "0.75rem",
                color: theme.palette.text.secondary,
                maxWidth: '70px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {story.username}
            </Typography>
          </Box>
        ))
      ) : (
        <Box width="100%" textAlign="center" py={2}>
          <Typography variant="body2" color="textSecondary">
            No stories available. Follow more people to see their stories.
          </Typography>
        </Box>
      )}
      </Paper>

      {selectedStoryId && (
        <StoryViewer
          initialStoryId={selectedStoryId}
          onClose={handleCloseViewer}
        />
      )}

      {isCreatingStory && (
        <CreateStory onClose={handleCloseCreateStory} />
      )}
    </>
  );
};

export default Stories;
