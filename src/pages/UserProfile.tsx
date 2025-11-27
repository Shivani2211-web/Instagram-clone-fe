import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Container,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Grid,
  styled,
} from "@mui/material";

// Create a styled div that behaves like a Grid item
const GridItem = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  [theme.breakpoints.up('sm')]: {
    flex: '0 0 auto',
    width: '33.333333%',
  },
  [theme.breakpoints.down('sm')]: {
    flex: '0 0 auto',
    width: '50%',
  },
}));
import { GridOn, BookmarkBorder } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { usersAPI } from "../api/endpoints";

interface UserPost {
  id: string;
  imageUrl: string;
  caption?: string;
}

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { currentUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await usersAPI.getUserProfile(username || '');
        const data = response?.data?.data || response?.data;
        
        if (!data) throw new Error('User not found');
        
        setUser({
          id: data._id || data.id,
          username: data.username,
          fullName: data.fullName || data.username,
          bio: data.bio || '',
          profilePicture: data.profilePicture || '/default-avatar.png',
          followers: data.followers || 0,
          following: data.following || 0,
          posts: data.posts || [],
          isFollowing: data.isFollowing || false
        });
        
        setIsFollowing(data.isFollowing || false);
        setFollowersCount(data.followers || 0);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setIsLoadingFollow(true);
    try {
      if (isFollowing) {
        await usersAPI.unfollowUser(user.id);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await usersAPI.followUser(user.id);
        setFollowersCount(prev => prev + 1);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Error toggling follow:', err);
      setError('Failed to update follow status');
    } finally {
      setIsLoadingFollow(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error || 'User not found'}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  const isCurrentUser = currentUser?.username === user.username;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 2 }}>
      <Container maxWidth="md">
        {/* Profile Header */}
        <Grid container spacing={4} alignItems="center" sx={{ py: 4 }}>
          <Box sx={{ 
            width: { xs: '100%', sm: '33.3333%', md: '25%' },
            display: 'flex',
            justifyContent: 'center',
            p: 2
          }}>
            <Avatar
              src={user.profilePicture}
              alt={user.username}
              sx={{
                width: 140,
                height: 140,
                border: '3px solid #e1306c',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            />
          </Box>

          <Box sx={{ 
            width: { xs: '100%', sm: '66.6667%', md: '75%' },
            p: 2
          }}>
            <Box display="flex" flexDirection="column" gap={2}>
              {/* Username + Follow Button */}
              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <Typography variant="h5" fontWeight={600}>
                  {user.username}
                </Typography>

                {!isCurrentUser && (
                  <Button
                    variant={isFollowing ? "outlined" : "contained"}
                    onClick={handleFollowToggle}
                    disabled={isLoadingFollow}
                    sx={{
                      minWidth: 100,
                      textTransform: 'none',
                      fontWeight: 600,
                      ...(isFollowing 
                        ? {
                            borderColor: "#e0e0e0",
                            color: "text.primary",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                              borderColor: "#bdbdbd",
                            }
                          }
                        : {
                            background: "linear-gradient(45deg, #fd1d1d, #e1306c)",
                            "&:hover": { opacity: 0.9 },
                          }
                      ),
                    }}
                  >
                    {isLoadingFollow ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : isFollowing ? (
                      "Following"
                    ) : (
                      "Follow"
                    )}
                  </Button>
                )}
              </Box>

              {/* Stats */}
              <Box display="flex" gap={4}>
                <Typography><strong>{user.posts?.length || 0}</strong> posts</Typography>
                <Typography><strong>{followersCount}</strong> followers</Typography>
                <Typography><strong>{user.following}</strong> following</Typography>
              </Box>

              {/* Bio */}
              <Typography>{user.bio}</Typography>
            </Box>
          </Box>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          centered
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab icon={<GridOn />} label="POSTS" />
          <Tab icon={<BookmarkBorder />} label="SAVED" />
        </Tabs>

        {/* Posts Grid */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
          gap: 2,
          mt: 2
        }}>
          {user.posts?.map((post: UserPost) => (
            <Box 
              key={post.id}
              sx={{
                width: '100%',
                aspectRatio: '1',
                overflow: 'hidden',
                borderRadius: 1,
                '&:hover': {
                  opacity: 0.9,
                },
              }}
            >
              <Box
                component="img"
                src={post.imageUrl}
                alt={post.caption || 'Post'}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  cursor: 'pointer',
                }}
              />
            </Box>
          ))}
        </Box>

        {user.posts?.length === 0 && (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="textSecondary">
              No posts yet
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default UserProfile;
