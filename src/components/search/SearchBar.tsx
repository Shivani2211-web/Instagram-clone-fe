import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Paper,
  CircularProgress,
} from "@mui/material";
import { searchApi } from "../../api/searchApi";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        try {
          const res = await searchApi.suggestions(query);
          setSuggestions(res?.data?.users || []);
        } catch (err) {
          console.error("Error fetching suggestions:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (item: any) => {
    setQuery("");
    setSuggestions([]);
    if (item.username) {
      navigate(`/profile/${item.username}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSuggestions([]);
    }
  };

  return (
    <Box 
      component="form"
      onSubmit={handleSubmit}
      sx={{ position: "relative", width: "100%", maxWidth: 350 }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Search users, hashtags, reels..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          sx: {
            borderRadius: 5,
            backgroundColor: "background.paper",
          },
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && query.trim()) {
            handleSubmit(e);
          }
        }}
      />
      {loading && (
        <CircularProgress
          size={22}
          sx={{ position: "absolute", right: 10, top: 8 }}
        />
      )}
      {suggestions.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: "absolute",
            top: "105%",
            left: 0,
            right: 0,
            maxHeight: 250,
            overflowY: "auto",
            zIndex: 10,
          }}
        >
          <List>
            {suggestions.map((user) => (
              <ListItem
                key={user._id}
                component="div"
                onClick={() => handleSelect(user)}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <ListItemAvatar>
                  <Avatar src={user.avatar || "/assets/default-avatar.png"} />
                </ListItemAvatar>
                <ListItemText
                  primary={`@${user.username}`}
                  secondary={user.fullName || ""}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;
