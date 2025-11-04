import { useRef, useState, useEffect } from 'react';
import { Box, IconButton, Typography, Avatar } from '@mui/material';
import { PlayArrow, Favorite, ChatBubbleOutline, SendOutlined, MoreVert, VolumeOff, VolumeUp } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';

interface Reel {
  id: string;
  videoUrl: string;
  user: {
    username: string;
    avatar: string;
  };
  caption: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

const Reels = () => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    const fetchReels = async () => {
      try {
        setLoading(true);
        // Replace with actual API call
        // const response = await api.get('/reels');
        // setReels(response.data);
        
        // Mock data
        setTimeout(() => {
          setReels([
            {
              id: '1',
              videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-under-neon-lights-1230-large.mp4',
              user: {
                username: 'dance_queen',
                avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
              },
              caption: 'Dancing my heart out! 💃 #dance #fun',
              likes: 1243,
              comments: 89,
              isLiked: false,
            },
            {
              id: '2',
              videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-playing-with-a-cat-1230-large.mp4',
              user: {
                username: 'cat_lover',
                avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
              },
              caption: 'Just me and my cat being silly 😺 #catsoftiktok',
              likes: 856,
              comments: 42,
              isLiked: true,
            },
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching reels:', error);
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  // Handle scroll to detect which reel is in view
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const scrollPosition = container.scrollTop;
      const windowHeight = window.innerHeight;
      
      // Find which reel is in the center of the viewport
      const newIndex = Math.round(scrollPosition / windowHeight);
      
      if (newIndex !== currentReelIndex && newIndex >= 0 && newIndex < reels.length) {
        setCurrentReelIndex(newIndex);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    
    return () => {
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [currentReelIndex, reels.length]);

  // Play/pause video when currentReelIndex changes
  useEffect(() => {
    if (videoRefs.current[currentReelIndex]) {
      const playPromise = videoRefs.current[currentReelIndex]?.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing video:', error);
        });
      }
      
      setIsPlaying(true);
    }

    // Pause all other videos
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentReelIndex) {
        video.pause();
      }
    });
  }, [currentReelIndex]);

  const togglePlayPause = () => {
    if (videoRefs.current[currentReelIndex]) {
      if (isPlaying) {
        videoRefs.current[currentReelIndex]?.pause();
      } else {
        videoRefs.current[currentReelIndex]?.play();
      }
      setIsPlaying(!isPlaying);
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

  const handleLike = (reelId: string) => {
    setReels(prevReels =>
      prevReels.map(reel =>
        reel.id === reelId
          ? { ...reel, isLiked: !reel.isLiked, likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1 }
          : reel
      )
    );
  };

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
          key={reel.id}
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
            ref={el => (videoRefs.current[index] = el)}
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
                    handleLike(reel.id);
                  }}
                  sx={{ color: reel.isLiked ? 'red' : 'white' }}
                >
                  <Favorite fontSize="large" />
                </IconButton>
                <Typography variant="caption" display="block">
                  {reel.likes.toLocaleString()}
                </Typography>
              </Box>

              <Box textAlign="center">
                <IconButton onClick={(e) => e.stopPropagation()} sx={{ color: 'white' }}>
                  <ChatBubbleOutline fontSize="large" />
                </IconButton>
                <Typography variant="caption" display="block">
                  {reel.comments.toLocaleString()}
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

export default Reels;
