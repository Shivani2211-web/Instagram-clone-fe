import { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI } from '../api/endpoints';
import Post from '../components/posts/Post';
import Stories from '../components/stories/Stories';


interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
    name?: string;
    avatar?: string;
  };
  text: string;
  createdAt: string;
}

interface PostType {
  _id: string;
  user: {
    _id: string;
    username: string;
    name?: string;
    avatar?: string;
  };
  image: string;
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

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await postsAPI.getAllPosts();

      const postsData = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      const formattedPosts = postsData.map((post: any) => ({
        _id: post._id,
        user: {
          _id: post.user?._id || post.userId,
          username: post.user?.username || "unknown",
          name: post.user?.name,
          avatar: post.user?.avatar,
        },
        image: post.image || "",
        caption: post.caption || "",
        likes: Array.isArray(post.likes) ? post.likes : [],
        comments: Array.isArray(post.comments) ? post.comments : [],
        createdAt: post.createdAt || new Date().toISOString(),
      }));

      setPosts(formattedPosts);
    } catch (err: any) {
      setError("Failed to load posts. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentUser?.id]);

  const handlePostUpdate = () => fetchPosts();
  const handlePostDelete = (postId: string) =>
    setPosts((prev) => prev.filter((p) => p._id !== postId));

  // Loading Screen
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: "#0095f6" }} />
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        backgroundColor: "background.default",
        pt: 3,
        pb: 8,
      }}
    >
      {/* MAIN WRAPPER */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          width: "100%",
          maxWidth: "975px",
          gap: 4,
          px: 2,
        }}
      >
        {/* LEFT FEED AREA */}
        <Box sx={{ width: "100%", maxWidth: "614px" }}>
          {/* STORIES */}
          <Box
            sx={{
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              p: 2,
              mb: 3,
              overflowX: "auto",
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
              boxShadow: 1,
            }}
          >
            <Stories />
          </Box>

          {/* ERROR MESSAGE */}
          {error && (
            <Box
              sx={{
                bgcolor: "error.light",
                color: "error.contrastText",
                p: 2,
                borderRadius: 2,
                mb: 3,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography>{error}</Typography>
              <Button onClick={fetchPosts} startIcon={<Refresh />}>
                Retry
              </Button>
            </Box>
          )}

          {/* POSTS DISPLAY */}
          {posts.length === 0 ? (
            <Box
              textAlign="center"
              p={4}
              sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" gutterBottom>
                No Posts Yet
              </Typography>
              <Typography color="text.secondary" paragraph>
                Follow more people to see their posts here.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={fetchPosts}
                startIcon={<Refresh />}
              >
                Refresh Feed
              </Button>
            </Box>
          ) : (
            posts.map((post) => (
              <Box
                key={post._id}
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  mb: 3,
                  overflow: "hidden",
                  boxShadow: 1,
                }}
              >
                <Post
                  post={post}
                  currentUserId={currentUser?.id}
                  onUpdate={handlePostUpdate}
                  onDelete={handlePostDelete}
                />
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
