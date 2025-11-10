import { useRef, useState, useEffect } from 'react';
import { Box, IconButton, Typography, Avatar, CircularProgress } from '@mui/material';
import { PlayArrow, Favorite, ChatBubbleOutline, SendOutlined, MoreVert, VolumeOff, VolumeUp } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { ReelsApi } from '../../api/endpoints';

interface Reel {
  _id: string;
  videoUrl: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  caption: string;
  likes: string[]; // Array of user IDs who liked the reel
  comments: any[]; // You might want to create a proper Comment interface
  isLiked?: boolean; // This will be computed based on current user's ID
  createdAt: string;
  likesCount?: number; // Add likesCount to match the API response
}

const Reels = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentReelIndex] = useState(0); // Removed setCurrentReelIndex as it's not used
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        setLoading(true);
        const response = await ReelsApi.getReels();
        const reelsWithLikes = response.data.map((reel: Reel) => ({
          ...reel,
          isLiked: reel.likes.includes(currentUser?.id || '')
        }));
        setReels(reelsWithLikes);
      } catch (err) {
        console.error('Error fetching reels:', err);
        setError('Failed to load reels. Please try again later.');
      } finally {
        setLoading(false);
        videoRefs.current.forEach(video => {
          if (video) {
            video.pause();
            video.currentTime = 0;
          }
        });
      }
    };

    fetchReels();
  }, [currentUser?.id]);

  const handleLike = async (reelId: string) => {
    try {
      const reelIndex = reels.findIndex(r => r._id === reelId);
      if (reelIndex === -1) return;

      const reel = reels[reelIndex];
      const isLiked = reel.isLiked;

      // Optimistic update
      const updatedReels = [...reels];
      updatedReels[reelIndex] = {
        ...reel,
        likes: isLiked 
          ? reel.likes.filter(id => id !== currentUser?.id)
          : [...reel.likes, currentUser?.id || ''],
        isLiked: !isLiked,
        likesCount: isLiked 
          ? (reel.likesCount || reel.likes.length) - 1 
          : (reel.likesCount || reel.likes.length) + 1
      };
      setReels(updatedReels);

      // API call
      if (isLiked) {
        await ReelsApi.unlikeReel(reelId);
      } else {
        await ReelsApi.likeReel(reelId);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      // Revert on error
      const reelIndex = reels.findIndex(r => r._id === reelId);
      if (reelIndex !== -1) {
        const updatedReels = [...reels];
        updatedReels[reelIndex] = {
          ...reels[reelIndex],
          isLiked: !reels[reelIndex].isLiked,
          likesCount: reels[reelIndex].likesCount || reels[reelIndex].likes.length
        };
        setReels(updatedReels);
      }
    }
  };

  // Commented out unused function
  // const handleAddComment = async (reelId: string, text: string) => {
  //   try {
  //     await ReelsApi.addComment(reelId, { text });
  //     // Refresh comments or update state
  //     const response = await ReelsApi.getReel(reelId);
  //     const updatedReels = reels.map(reel => 
  //       reel._id === reelId ? response.data : reel
  //     );
  //     setReels(updatedReels);
  //   } catch (err) {
  //     console.error('Error adding comment:', err);
  //   }
  // };

  useEffect(() => {
    const handleScroll = () => {
      // Handle scroll event
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }   const togglePlayPause = async () => {
    const video = videoRefs.current[currentReelIndex];
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          // Store the promise to handle cleanup
          const currentPlayPromise = playPromise;
          
          const result = await Promise.race([
            currentPlayPromise,
            new Promise((_, reject) => {
              // This will reject if the component unmounts or video is removed
              const onAbort = () => reject(new Error('Playback aborted'));
              video.addEventListener('abort', onAbort, { once: true });
              return () => video.removeEventListener('abort', onAbort);
            })
          ]).catch(error => {
            // Only log if it's not our expected abort error
            if (error.message !== 'Playback aborted') {
              console.error('Error playing video:', error);
            }
            setIsPlaying(false);
            return null;
          });

          if (result !== null) {
            setIsPlaying(true);
          }
        }
      }
    } catch (error: unknown) {
      // Ignore the error if it's because the video was removed
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error toggling play/pause:', error);
      }
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (videoRefs.current[currentReelIndex]) {
      if (videoRefs.current[currentReelIndex]) {
        videoRefs.current[currentReelIndex]!.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  // const handleLike = (reelId: string) => {
  //   setReels(prevReels =>
  //     prevReels.map(reel =>
  //       reel.id === reelId
  //         ? { ...reel, isLiked: !reel.isLiked, likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1 }
  //         : reel
  //     )
  //   );
  // };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <Typography>Loading reels...</Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        height: 'calc(100vh - 56px)', // Adjust based on your header height
        overflowY: 'auto',
        scrollSnapType: 'y mandatory',
        scrollBehavior: 'smooth',
        '&::-webkit-scrollbar': {
          display: 'none', // Hide scrollbar for a cleaner look
        },
        WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
      }}
    >
      {reels.map((reel, index) => (
        <Box
          key={reel._id}
          sx={{
            position: 'relative',
            width: '100%',
            height: '100vh',
            scrollSnapAlign: 'start',
            overflow: 'hidden',
            bgcolor: 'black',
          }}
          onClick={togglePlayPause}
        >
          {/* Video */}
          <video
            ref={el => {
              if (el) {
                videoRefs.current[index] = el;
              }
            }}
            src={reel.videoUrl}
            loop
            muted={isMuted}
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Video Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 2,
              color: 'white',
            }}
          >
            {/* Top Bar */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar src={reel.user.avatar} alt={reel.user.username} />
                <Typography variant="subtitle2">@{reel.user.username}</Typography>
                <Box 
                  component="button" 
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '4px',
                    px: 1,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  Follow
                </Box>
              </Box>
              <IconButton onClick={(e) => e.stopPropagation()}>
                <MoreVert sx={{ color: 'white' }} />
              </IconButton>
            </Box>

            {/* Right Sidebar */}
            <Box 
              sx={{
                position: 'absolute',
                right: 16,
                bottom: 80,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box textAlign="center">
                <IconButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(reel._id);
                  }}
                  sx={{ color: reel.isLiked ? 'red' : 'white' }}
                >
                  <Favorite fontSize="large" />
                </IconButton>
                <Typography variant="caption" display="block">
                  {(reel.likesCount || reel.likes.length).toLocaleString()}
                </Typography>
              </Box>

              <Box textAlign="center">
                <IconButton onClick={(e) => e.stopPropagation()} sx={{ color: 'white' }}>
                  <ChatBubbleOutline fontSize="large" />
                </IconButton>
                <Typography variant="caption" display="block">
                  {reel.comments?.length?.toLocaleString() || '0'}
                </Typography>
              </Box>

              <IconButton onClick={(e) => e.stopPropagation()} sx={{ color: 'white' }}>
                <SendOutlined fontSize="large" />
              </IconButton>

              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }} 
                sx={{ color: 'white' }}
              >
                {isMuted ? <VolumeOff fontSize="large" /> : <VolumeUp fontSize="large" />}
              </IconButton>

              <Box 
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid white',
                }}
              >
                <Avatar 
                  src={reel.user.avatar} 
                  alt={reel.user.username} 
                  sx={{ width: '100%', height: '100%' }} 
                />
              </Box>
            </Box>

            {/* Caption */}
            <Box 
              sx={{
                maxWidth: '70%',
                mb: 2,
              }}
            >
              <Typography variant="body2">
                <strong>@{reel.user.username}</strong> {reel.caption}
              </Typography>
            </Box>
          </Box>

          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
              }}
              onClick={togglePlayPause}
            >
              <PlayArrow sx={{ fontSize: 60, color: 'white' }} />
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default Reels
