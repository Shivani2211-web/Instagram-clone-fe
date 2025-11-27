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
  Paper,
} from "@mui/material";
import { Edit as EditIcon, GridOn, BookmarkBorder } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from '@mui/material/styles';
import { usersAPI } from "../api/endpoints";

interface UserProfile {
  id: string;
  profilePicture: string;
  username: string;
  bio?: string;
  followers: number;
  following: number;
  posts: UserPost[];
  isFollowing?: boolean;
  hasPendingRequest?: boolean;
}

interface UserPost {
  id: string;
  imageUrl: string;
  caption?: string;
}

const Profile = () => {
  const { username: urlUsername } = useParams<{ username?: string }>();
  const { currentUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  // Update follow status when user data changes
  useEffect(() => {
    if (user) {
      setIsFollowing(user.isFollowing || false);
      setFollowersCount(user.followers);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        let response;
        if (
          !urlUsername ||
          urlUsername === "undefined" ||
          (currentUser && urlUsername === currentUser.username)
        ) {
          if (!currentUser) throw new Error("Please log in to view your profile");
          response = await usersAPI.getMe();
        } else {
          response = await usersAPI.getUserProfile(urlUsername);
        }

        const data = response?.data?.data || response?.data;
        if (!data) throw new Error("Invalid user data received");

        setUser({
          id: data._id || data.id,
          profilePicture: data.profilePicture || "/assets/default-avatar.png",
          username: data.username,
          bio: data.bio || "Hey there! I'm using Instagram Clone 🌸",
          followers: typeof data.followers === "number" ? data.followers : data.followers?.length || 0,
          following: typeof data.following === "number" ? data.following : data.following?.length || 0,
          isFollowing: data.isFollowing || false,
          hasPendingRequest: data.hasPendingRequest || false,
          posts: (data.posts || []).map((post: any) => ({
            id: post._id || post.id,
            imageUrl: post.image || post.imageUrl || "/assets/default-post.png",
            caption: post.caption || "",
          })),
        });
      } catch (err: any) {
        console.error("Failed to load profile:", err);
        if (isMounted) {
          setError(err.message || "Failed to load profile");
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [urlUsername, currentUser]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: "#e1306c" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: "center", py: 10 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 2,
            background: "linear-gradient(45deg, #fd1d1d, #e1306c)",
            "&:hover": { opacity: 0.9 },
          }}
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: "center", py: 10 }}>
        <Typography variant="h6" color="text.primary" gutterBottom>
          {!urlUsername ? "Please log in to view your profile" : "User not found"}
        </Typography>
        {!urlUsername && (
          <Button
            variant="contained"
            sx={{
              mt: 2,
              background: "linear-gradient(45deg, #5851db, #833ab4, #e1306c)",
            }}
            onClick={() => navigate("/login")}
          >
            Go to Login
          </Button>
        )}
      </Container>
    );
  }

  const isCurrentUser = currentUser?.username === user.username;

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

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 2 }}>
      <Container maxWidth="md">
        {/* Profile Header */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          alignItems: 'center',
          py: 4,
          '& > *': {
            flex: '1 1 100%',
            [theme.breakpoints.up('sm')]: {
              flex: '0 0 50%',
              maxWidth: '50%',
            },
            [theme.breakpoints.up('md')]: {
              flex: '0 0 25%',
              maxWidth: '25%',
            },
          },
        }}>
          <Box 
            sx={{ 
              width: { xs: '100%', sm: '33.3333%', md: '25%' },
              display: 'flex',
              justifyContent: 'center',
              p: 2
            }}
          >
            <Avatar
              src={user.profilePicture}
              alt={user.username}
              sx={{
                width: 140,
                height: 140,
                border: "3px solid #e1306c",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            />
          </Box>

          <Box sx={{ 
            width: { xs: '100%', sm: '66.6667%', md: '75%' },
            p: 2
          }}>
            <Box display="flex" flexDirection="column" gap={2}>
              {/* Username + Button */}
              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <Typography
                  variant="h5"
                  fontWeight={600}
                  sx={{ color: "text.primary" }}
                >
                  {user.username}
                </Typography>

                {isCurrentUser ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      borderColor: "#e1306c",
                      color: "#e1306c",
                      "&:hover": {
                        backgroundColor: "rgba(225, 48, 108, 0.1)",
                        borderColor: "#e1306c",
                      },
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    variant={isFollowing ? "outlined" : "contained"}
                    onClick={handleFollowToggle}
                    disabled={isLoadingFollow}
                    sx={{
                      minWidth: 100,
                      textTransform: "none",
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

              {/* Stats Row */}
              <Box display="flex" gap={4} sx={{ color: "text.primary" }}>
                <Typography variant="body1">
                  <b>{user.posts?.length || 0}</b> posts
                </Typography>
                <Typography variant="body1">
                  <b>{followersCount}</b> followers
                </Typography>
                <Typography variant="body1">
                  <b>{user.following}</b> following
                </Typography>
              </Box>

              {/* Bio */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 500 }}
              >
                {user.bio}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          centered
          textColor="secondary"
          indicatorColor="secondary"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              color: "text.secondary",
            },
            "& .Mui-selected": { color: "#e1306c" },
          }}
        >
          <Tab icon={<GridOn />} iconPosition="start" label="Posts" />
          <Tab icon={<BookmarkBorder />} iconPosition="start" label="Saved" />
        </Tabs>

        {/* Posts Grid */}
        {tab === 0 && (
          <>
            {user.posts?.length > 0 ? (
              <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
          gap: 2,
          mt: 2
        }}>
                {user.posts.map((post) => (
                  <Box sx={{
                width: '100%',
                aspectRatio: '1',
                overflow: 'hidden',
                borderRadius: 1,
                '&:hover': {
                  opacity: 0.9,
                },
              }}>
                    <Paper
                      elevation={1}
                      sx={{
                        position: "relative",
                        aspectRatio: "1 / 1",
                        cursor: "pointer",
                        overflow: "hidden",
                        borderRadius: 2,
                        "&:hover img": {
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={post.imageUrl}
                        alt={post.caption}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s ease-in-out",
                        }}
                      />
                    </Paper>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box textAlign="center" py={10}>
                <Typography variant="body1" color="text.secondary">
                  No posts yet
                </Typography>
              </Box>
            )}
          </>
        )}

        {tab === 1 && (
          <Box textAlign="center" py={10}>
            <Typography variant="body1" color="text.secondary">
              Saved posts will appear here
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Profile;
