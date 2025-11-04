import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Avatar,
  Typography,
  Button,
  CircularProgress,
  Container,
  Paper,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { usersAPI } from "../api/endpoints";

interface UserProfile {
  id: string;
  profilePicture: string;
  username: string;
  bio?: string;
  followers: number;
  following: number;
  posts: UserPost[];
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
  const navigate = useNavigate();

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
          followers:
            typeof data.followers === "number" ? data.followers : data.followers?.length || 0,
          following:
            typeof data.following === "number" ? data.following : data.following?.length || 0,
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

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Profile Header */}
      <Grid container spacing={4} alignItems="center">
        <Grid container spacing={4} alignItems="center">
          <Avatar
            src={user.profilePicture}
            alt={user.username}
            sx={{
              width: 130,
              height: 130,
              border: "3px solid #e1306c",
              boxShadow: "0 0 5px rgba(0,0,0,0.2)",
            }}
          />
        </Grid>

     <Grid container spacing={4} alignItems="center">
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Typography variant="h5" fontWeight="600" sx={{color:"white"}}>
              {user.username}
            </Typography>
            {isCurrentUser && (
              <Button
                variant="outlined"
                sx={{
                  borderColor: "white",
                  color: "white",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#fafafa" },
                }}
              >
                Edit Profile
              </Button>
            )}
          </Box>

          {/* Stats */}
          <Box display="flex" gap={4} mt={2} sx={{color:"white"}}>
            <Typography variant="body1">
              <b>{user.posts?.length || 0}</b> posts
            </Typography>
            <Typography variant="body1">
              <b>{user.followers}</b> followers
            </Typography>
            <Typography variant="body1">
              <b>{user.following}</b> following
            </Typography>
          </Box>

          {/* Bio */}
          <Typography
            variant="body2"
            color="white"
            sx={{ mt: 2, maxWidth: 400 }}
          >
            {user.bio}
          </Typography>
        </Grid>
      </Grid>

      {/* Divider */}
      <Box
        sx={{
          mt: 5,
          mb: 4,
          height: "1px",
          backgroundColor: "white",
        }}
      />

      {/* Posts Grid */}
      {user.posts?.length > 0 ? (
        <Grid container spacing={1}>
          {user.posts.map((post) => (
            <Grid container spacing={4} alignItems="center" key={post.id}>
              <Paper
                elevation={0}
                sx={{
                  position: "relative",
                  aspectRatio: "1 / 1",
                  cursor: "pointer",
                  overflow: "hidden",
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
                    transition: "opacity 0.2s ease-in-out",
                    "&:hover": { opacity: 0.8 },
                  }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" py={10}>
          <Typography variant="body1" color="white">
            No posts yet
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Profile;
