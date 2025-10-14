import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, CircularProgress, Fab, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import Stories from '../components/stories/Stories';
import Post from '../components/posts/Post';
import { postsAPI } from '../api/endpoints';

interface Post {
  id: string;
  username: string;
  userAvatar: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  createdAt: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval} YEAR${interval === 1 ? '' : 'S'} AGO`;
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} MONTH${interval === 1 ? '' : 'S'} AGO`;
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} DAY${interval === 1 ? '' : 'S'} AGO`;
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} HOUR${interval === 1 ? '' : 'S'} AGO`;
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} MINUTE${interval === 1 ? '' : 'S'} AGO`;
  
  return 'JUST NOW';
};

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const navigate = useNavigate();
  // const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await postsAPI.getAllPosts();
        
        // Check if response.data exists and has a data array
        if (!response.data?.success || !Array.isArray(response.data.data)) {
          console.error('Invalid posts data format:', response.data);
          return;
        }

        const formattedPosts = response.data.data.map((post: any) => ({
          id: post._id,
          username: post.user?.username || '',
          userAvatar: post.user?.avatar || '',
          image: post.image,
          caption: post.text || '',
          likes: post.likes?.length || 0,
          comments: post.comments?.length || 0,
          createdAt: post.createdAt || new Date().toISOString(),
          isLiked: post.likes?.some((like: any) => like.user === 'current-user-id'),
          isSaved: false
        }));
        
        setPosts(formattedPosts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        // You can set an error state here to show to the user
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        sx={{
          background: 'linear-gradient(to bottom, #fafafa, #e0e0e0)'
        }}
      >
        <CircularProgress sx={{ color: '#0095f6' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <Box 
        sx={{
          flex: '0 0 auto',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #dbdbdb',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Container maxWidth="md" sx={{ p: 0 }}>
          <Box sx={{ 
            overflowX: 'auto',
            py: 2,
            px: 2,
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}>
            <Stories />
          </Box>
        </Container>
      </Box>

      {/* Scrollable content */}
      <Box sx={{
        flex: '1 1 auto',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#555',
        },
      }}>
        <Container 
          maxWidth="md"
          sx={{
            backgroundColor: '#ffffff',
            p: 0,
            borderLeft: '1px solid #dbdbdb',
            borderRight: '1px solid #dbdbdb',
            minHeight: 'calc(100vh - 73px)', // Adjust based on your header height
          }}
        >
          <Box sx={{ maxWidth: '614px', mx: 'auto', py: 2 }}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <Box 
                key={post.id}
                sx={{
                  mb: 4,
                  border: '1px solid #dbdbdb',
                  borderRadius: '3px',
                  backgroundColor: '#ffffff',
                }}
              >
                <Post 
                  username={post.username}
                  userAvatar={post.userAvatar}
                  image={post.image}
                  caption={post.caption}
                  likes={post.likes}
                  comments={post.comments}
                  timestamp={formatTimeAgo(post.createdAt)}
                  isLiked={post.isLiked}
                  isSaved={post.isSaved}
                />
              </Box>
            ))
          ) : (
            <Box 
              textAlign="center" 
              py={8}
              sx={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                p: 4,
                mt: 4,
                border: '1px solid #dbdbdb'
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Posts Yet
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Follow users to see their posts here.
              </Typography>
              <Button
                variant="contained" 
                color="primary" 
                sx={{ mt: 2, textTransform: 'none' }}
                onClick={() => navigate('/explore')}
              >
                Explore Users
              </Button>
            </Box>
          )}
        </Box>

        {/* Create Post FAB */}
        <Fab 
          color="primary" 
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d)',
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'all 0.2s ease-in-out'
            },
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
          onClick={() => navigate('/create')}
        >
          <AddIcon />
        </Fab>
      </Container>
    </Box>
    </Box>  
  );
};

export default Home;
