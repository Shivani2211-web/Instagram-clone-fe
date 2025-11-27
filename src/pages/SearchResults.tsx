import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Avatar,
  Paper,
  CircularProgress,
} from "@mui/material";
import { searchApi } from "../api/searchApi";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearch = async () => {
      try {
        setLoading(true);
        const res = await searchApi.general(query, "all");
        setResults(res?.data);
      } catch (err) {
        console.error("Error loading search results:", err);
      } finally {
        setLoading(false);
      }
    };

    if (query.trim()) fetchSearch();
  }, [query]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );

  if (!results)
    return (
      <Typography textAlign="center" mt={10}>
        No results found.
      </Typography>
    );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="600" mb={3}>
        Results for “{query}”
      </Typography>

      {/* Users */}
      {results.users?.length > 0 && (
        <Box mb={5}>
          <Typography variant="h6" gutterBottom>Users</Typography>
          <Grid container spacing={2}>
            {results.users.map((user: any) => (
              <Grid item xs={12} sm={6} md={4} key={user._id}>
                <Paper
                  onClick={() => navigate(`/profile/${user.username}`)}
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Avatar src={user.avatar} />
                  <Box>
                    <Typography>@{user.username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.fullName || ""}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Hashtags */}
      {results.hashtags?.length > 0 && (
        <Box mb={5}>
          <Typography variant="h6" gutterBottom>Hashtags</Typography>
          <Grid container spacing={2}>
            {results.hashtags.map((post: any) => (
              <Grid item xs={6} sm={4} md={3} key={post._id}>
                <Paper
                  elevation={1}
                  sx={{
                    aspectRatio: "1 / 1",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  <Box
                    component="img"
                    src={post.image}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.3s ease-in-out",
                      "&:hover": { transform: "scale(1.05)" },
                    }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default SearchResults;
