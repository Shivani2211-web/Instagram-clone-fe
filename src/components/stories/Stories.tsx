import {
  Box,
  Avatar,
  Typography,
  useTheme,
  Paper,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import StoryViewer from "./StoryViewer";
import { Add as AddIcon } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import CreateStory from "./CreateStory";
import { storiesAPI } from "../../api/endpoints";
import type { Story } from "../../types/story";

const Stories = () => {
  // ---- Hooks ----
  const { currentUser } = useAuth();
  const theme = useTheme();

  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Functions ----
  const fetchStories = useCallback(async () => {
    if (!currentUser) {
      console.log('No current user, skipping stories fetch');
      setStories([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching stories for user:', currentUser.username);
      setLoading(true);
      setError(null);

      // Get stories from users the current user is following
      const followingStories = await storiesAPI.getFollowingStories();
      console.log('Stories from followed users:', followingStories);
      
      // Get current user's own stories
      const myStories = await storiesAPI.getMyStories();
      console.log('Current user stories:', myStories);
      
      // Combine both lists and remove duplicates
      const allStories = [...(followingStories || []), ...(myStories || [])];
      const uniqueStories = Array.from(new Map(
        allStories.map(story => [story.id, story])
      ).values());
      
      console.log('All unique stories:', uniqueStories);
      setStories(uniqueStories);
      
    } catch (err) {
      console.error("Error fetching stories:", err);
      setError("Failed to load stories. Please try again later.");
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const handleStoryCreated = useCallback(() => {
    setIsCreatingStory(false);
    fetchStories();
  }, [fetchStories]);

  // ---- Effects ----
  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // ---- Event Handlers ----
  const handleStoryClick = (storyId: string) => {
    const story = stories.find(s => s.id === storyId);
    if (story) {
      setSelectedStoryId(storyId);
      // Mark as viewed if not already
      if (!story.isViewed) {
        setStories(prevStories => 
          prevStories.map(s => 
            s.id === storyId ? { ...s, isViewed: true } : s
          )
        );
        // You might want to add an API call here to mark the story as viewed
      }
    }
  };
  const handleCloseViewer = () => setSelectedStoryId(null);
  const handleCreateStory = () => setIsCreatingStory(true);
  const handleCloseCreateStory = () => setIsCreatingStory(false);

  // ---- Render ----
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2} textAlign="center">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

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
                position: "relative",
                p: "3px",
                borderRadius: "50%",
                background:
                  theme.palette.mode === "dark" ? "#333" : "#f0f0f0",
              }}
            >
              <Avatar
                src={currentUser.avatar}
                alt={currentUser.username}
                sx={{
                  width: 60,
                  height: 60,
                  border: "2px solid white",
                  cursor: "pointer",
                  opacity: 0.8,
                  "&:hover": { opacity: 1 },
                }}
              />
              <IconButton
                onClick={handleCreateStory}
                size="small"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  "&:hover": {
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
                maxWidth: "70px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Your Story
            </Typography>
          </Box>
        )}

        {/* Stories List */}
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
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.05)" },
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
                  maxWidth: "70px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
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
          stories={stories}
        />
      )}

      {isCreatingStory && (
        <CreateStory
          onClose={handleCloseCreateStory}
          onStoryCreated={handleStoryCreated}
        />
      )}
    </>
  );
};

export default Stories;
