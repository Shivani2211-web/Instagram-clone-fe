import { useState, useEffect } from 'react';
import { Box, Container, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI } from '../api/endpoints';
import Post from '../components/posts/Post';
import Stories from '../components/stories/Stories';
import '../styles.css';

interface User {
  _id: string;
  username: string;
  name?: string;
  avatar?: {
    url?: string;
  };
}

interface Comment {
  _id: string;
  user: User;
  text: string;
  createdAt: string;
}

interface PostType {
  _id: string;
  user: User;
  image?: string;
  media?: Array<{ url: string }>;
  caption: string;
  likes: Array<{ user: string }>;
  comments: Comment[];
  createdAt: string;
}


const Home = () => {
    const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await postsAPI.getAllPosts();
        console.log('Posts API Response:', response);

        if (response.status !== 200) {
          throw new Error(`Failed to fetch posts: ${response.statusText}`);
        }

        if (!response.data) {
          throw new Error('No data received from the server');
        }

        // Handle different response formats
        const postsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.data || response.data.posts || []);

        if (!Array.isArray(postsData)) {
          throw new Error('Invalid posts data format');
        }

        const formattedPosts = postsData.map((post: any) => ({
          _id: post._id,
          user: {
            _id: post.user?._id || post.userId || 'unknown',
            username: post.user?.username || 'unknown',
            name: post.user?.name,
            avatar: post.user?.avatar
          },
          image: post.image || post.media?.[0]?.url || '',
          caption: post.caption || '',
          likes: Array.isArray(post.likes) ? post.likes : [],
          comments: Array.isArray(post.comments) ? post.comments : [],
          createdAt: post.createdAt || new Date().toISOString()
        }));

        setPosts(formattedPosts);
      } catch (err: any) {
        console.error('Error fetching posts:', err);
        setError(err.message || 'Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentUser?.id]);

  const handlePostUpdate = (postId: string) => {
    // If you need to update the post data, you can fetch it again here
    // For now, we'll just trigger a refetch of all posts
    fetchPosts();
  };

  const handlePostDelete = (postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        sx={{
          backgroundColor: '#121212'
        }}
      >
        <CircularProgress sx={{ color: '#0095f6' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: '#fafafa',
        minHeight: '100vh',
        color: '#262626',
        paddingTop: '30px',
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          padding: { xs: '0 16px', sm: '0 20px' },
        }}
      >
        {/* Stories Section */}
        <Box 
          sx={{
            width: '100%',
            backgroundColor: 'white',
            border: '1px solid #dbdbdb',
            borderRadius: '8px',
            padding: '16px',
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
          }}
        >
          <Stories />
        </Box>

        {/* Error Message */}
        {error && (
          <Box 
            sx={{ 
              width: '100%',
              color: 'error.main',
              backgroundColor: 'rgba(237, 73, 86, 0.1)',
              padding: '12px 16px',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            {error}
          </Box>
        )}

        {/* Posts Feed */}
        <Box 
          sx={{
            width: '100%',
            maxWidth: '614px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            marginBottom: '30px',
          }}
        >
          {posts.map((post) => (
            <Box
              key={post._id}
              sx={{
                backgroundColor: 'white',
                border: '1px solid #dbdbdb',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <Post
                post={post}
                currentUserId={currentUser?.id}
                onUpdate={handlePostUpdate}
                onDelete={handlePostDelete}
              />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
