import { useRef, useState, useEffect } from 'react';
import { Box, IconButton, Typography, Avatar, CircularProgress } from '@mui/material';
import { Favorite, ChatBubbleOutline, SendOutlined, MoreVert, VolumeOff, VolumeUp } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { ReelsApi } from '../../api/endpoints';

interface User {
  _id: string;
  username: string;
  avatar?: string;
}

interface Reel {
  _id: string;
  videoUrl: string;
  user: User;
  caption: string;
  likes: string[];
  comments: any[];
  isLiked?: boolean;
  createdAt: string;
  likesCount?: number;
}

const Reels = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fetch reels
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
      }
    };
    fetchReels();
  }, [currentUser?.id]);

  // Auto play/pause on scroll using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [reels]);

  const handleLike = async (reelId: string) => {
    try {
      const reelIndex = reels.findIndex((r) => r._id === reelId);
      if (reelIndex === -1) return;

      const reel = reels[reelIndex];
      const isLiked = reel.isLiked;

      // Optimistic UI update
      const updatedReels = [...reels];
      updatedReels[reelIndex] = {
        ...reel,
        likes: isLiked
          ? reel.likes.filter((id) => id !== currentUser?.id)
          : [...reel.likes, currentUser?.id || ''],
        isLiked: !isLiked,
        likesCount: isLiked
          ? (reel.likesCount || reel.likes.length) - 1
          : (reel.likesCount || reel.likes.length) + 1
      };
      setReels(updatedReels);

      if (isLiked) {
        await ReelsApi.unlikeReel(reelId);
      } else {
        await ReelsApi.likeReel(reelId);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const toggleMute = () => {
    videoRefs.current.forEach((video) => {
      if (video) video.muted = !isMuted;
    });
    setIsMuted(!isMuted);
  };

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
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        height: 'calc(100vh - 56px)',
        overflowY: 'auto',
        scrollSnapType: 'y mandatory',
        scrollBehavior: 'smooth',
        '&::-webkit-scrollbar': { display: 'none' },
        WebkitOverflowScrolling: 'touch',
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
        >
          {reel.videoUrl ? (
            <video
              ref={(el) => {
                if (el) videoRefs.current[index] = el;
              }}
              src={reel.videoUrl}
              loop
              muted={isMuted}
              playsInline
              poster="https://via.placeholder.com/1080x1920?text=Loading+video..."
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                console.error('Video failed to load:', e);
                (e.target as HTMLVideoElement).poster =
                  'https://via.placeholder.com/1080x1920?text=Video+Unavailable';
              }}
            />
          ) : (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: 'black',
                color: 'white',
              }}
            >
              <Typography variant="h6">🎥 No video available</Typography>
            </Box>
          )}

          {/* Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 80%)',
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
                <Avatar 
                  src={reel.user?.avatar || '/default-avatar.png'} 
                  alt={reel.user?.username || 'user'} 
                />
                <Typography variant="subtitle2">
                  @{reel.user?.username || 'unknown_user'}
                </Typography>
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
            </Box>

            {/* Caption */}
            <Box sx={{ maxWidth: '70%', mb: 2 }}>
              <Typography variant="body2">
                <strong>@{reel.user?.username || 'user'}</strong> {reel.caption}
              </Typography>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default Reels;
