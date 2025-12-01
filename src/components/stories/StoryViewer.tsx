import { useState, useEffect, useCallback } from 'react';
import { Box, IconButton, Avatar, Typography, CircularProgress } from '@mui/material';
import { Close, NavigateBefore, NavigateNext } from '@mui/icons-material';
// import { useStories } from '../../hooks/api/useStories';

interface StoryViewerProps {
  initialStoryId: string;
  stories: any[]; // Replace 'any' with your Story type
  onClose: () => void;
  onStoryViewed?: (storyId: string) => Promise<void>;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ initialStoryId, stories, onClose, onStoryViewed }) => {
  const [loading, setLoading] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const STORY_DURATION = 5000; // 5 seconds per story

  // Find the initial story index
  useEffect(() => {
    const index = stories.findIndex(story => story.id === initialStoryId);
    if (index !== -1) {
      setCurrentStoryIndex(index);
      startProgress();
      markAsViewed(initialStoryId);
    }
  }, [initialStoryId, stories]);

  const currentStory = stories[currentStoryIndex];
  const hasNext = currentStoryIndex < stories.length - 1;
  const hasPrev = currentStoryIndex > 0;

  const markAsViewed = useCallback(async (storyId: string) => {
    if (!onStoryViewed) return;
    try {
      setLoading(true);
      await onStoryViewed(storyId);
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    } finally {
      setLoading(false);
    }
  }, [onStoryViewed]);

  const startProgress = useCallback(() => {
    setProgress(0);
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (!isPaused) {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
        setProgress(newProgress);

        if (newProgress >= 100) {
          clearInterval(interval);
          handleNext();
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, currentStoryIndex, stories.length]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      setCurrentStoryIndex(prev => {
        const nextIndex = prev + 1;
        markAsViewed(stories[nextIndex].id);
        return nextIndex;
      });
      setProgress(0);
    } else {
      onClose();
    }
  }, [hasNext, onClose, stories, markAsViewed]);

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      setCurrentStoryIndex(prev => {
        const prevIndex = prev - 1;
        markAsViewed(stories[prevIndex].id);
        return prevIndex;
      });
      setProgress(0);
    }
  }, [hasPrev, stories, markAsViewed]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'Escape') onClose();
  }, [handleNext, handlePrev, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading || !currentStory) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1400,
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1400,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Progress bars */}
      <Box sx={{ display: 'flex', gap: 1, p: 1, width: '100%' }}>
        {stories.map((_, index) => (
          <Box 
            key={index}
            sx={{
              flex: 1,
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${index === currentStoryIndex ? progress : index < currentStoryIndex ? 100 : 0}%`,
                backgroundColor: 'white',
                transition: 'width 0.1s linear',
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Avatar 
          src={currentStory.userAvatar} 
          alt={currentStory.username}
          sx={{ width: 40, height: 40, mr: 1.5 }}
        />
        <Typography variant="subtitle2" color="white">
          {currentStory.username}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            position: 'absolute',
            right: 16,
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
          }}
        >
          <Close />
        </IconButton>
      </Box>

      {/* Story content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img
          src={currentStory.image}
          alt="Story"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />

        {/* Navigation buttons */}
        <Box
          onClick={handlePrev}
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            cursor: 'pointer',
            '&:hover': {
              '& .nav-button': {
                opacity: 1,
              },
            },
          }}
        >
          <IconButton
            className="nav-button"
            sx={{
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              opacity: 0,
              transition: 'opacity 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              },
            }}
            disabled={!hasPrev}
          >
            <NavigateBefore />
          </IconButton>
        </Box>

        <Box
          onClick={handleNext}
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            cursor: 'pointer',
            '&:hover': {
              '& .nav-button': {
                opacity: 1,
              },
            },
          }}
        >
          <IconButton
            className="nav-button"
            sx={{
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              opacity: 0,
              transition: 'opacity 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              },
            }}
            disabled={!hasNext}
          >
            <NavigateNext />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default StoryViewer;
