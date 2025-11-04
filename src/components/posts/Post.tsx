import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { postsAPI } from "../../api/endpoints";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  CardMedia,
  CardActions,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Send as SendIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

const formatTimeAgo = (dateString?: string | null) => {
  if (!dateString) return 'Just now';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Just now';

  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 0) return 'Just now';

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

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=User&background=random&color=fff&size=150";
const IMAGE_PLACEHOLDER = "https://via.placeholder.com/600x400/f5f5f5/999999?text=Image+Not+Available";

interface User {
  _id: string;
  name?: string;
  username: string;
  avatar?: string;
}

interface Comment {
  _id: string;
  user: User;
  text: string;
  createdAt: string;
}

interface PostProps {
  post: {
    _id: string;
    user: User;
    image: string;
    caption: string;
    likes: { user: string }[];
    comments: Comment[];
    createdAt: string;
  };
  currentUserId?: string;
  onUpdate?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

const Post: React.FC<PostProps> = ({
  post,
  currentUserId,
  onUpdate,
  onDelete,
}) => {
  // Destructure post properties
  const { _id, user, image, caption, likes = [], comments = [], createdAt } = post;
  const { currentUser } = useAuth();
  // currentUserId is used in the component's props but not directly in the component
  // It's kept for potential future use
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(image);
  const [currentAvatar, setCurrentAvatar] = useState(user?.avatar || DEFAULT_AVATAR);
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  // Comment error state is used in the catch blocks
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const commentsPerPage = 5;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user has liked the post
  // Update like status when likes or currentUser changes
  useEffect(() => {
    if (currentUser && likes) {
      setIsLiked(likes.some(like => like.user === currentUser.id));
    }
  }, [currentUser, likes]);

  // Initialize comments when component mounts or post changes
  useEffect(() => {
    if (post.comments && post.comments.length > 0) {
      setPostComments(post.comments);
    } else if (showComments) {
      // If no comments in props but comments section is open, fetch them
      fetchComments(1, false);
    }
  }, [post.comments, showComments]);

  // Handle image loading errors and loading states
  const handleImageError = () => {
    setCurrentImage(IMAGE_PLACEHOLDER)
    setIsImageLoading(false);
  };
  const handleAvatarError = () => setCurrentAvatar(DEFAULT_AVATAR);
  const handleImageLoad = () => setIsImageLoading(false);

  // Handle post like/unlike
  const handleLike = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      if (isLiked) {
        await postsAPI.unlikePost(_id);
      } else {
        await postsAPI.likePost(_id);
      }
      setIsLiked(!isLiked);
      onUpdate?.(_id);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };
const isGooglePhotosUrl = (url: string | undefined | null) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('google.com') || url.includes('googleusercontent.com');
};
  const fetchComments = async (page = 1, append = false) => {
    if (!hasMoreComments && page > 1) return;

    try {
      setIsLoadingComments(true);
      setCommentError(null);

      const response = await postsAPI.getPostComments(_id, {
        page,
        limit: commentsPerPage
      });

      // Check if response has data array
      const commentsData = response.data?.data || [];

      if (Array.isArray(commentsData)) {
        const formattedComments = commentsData.map(comment => ({
          _id: comment._id,
          text: comment.content,
          createdAt: comment.createdAt,
          user: {
            _id: comment.user?._id || 'unknown',
            username: comment.user?.username || 'unknown',
            name: comment.user?.name || 'Unknown User',
            avatar: comment.user?.avatar || DEFAULT_AVATAR
          }
        }));

        console.log('Formatted comments:', formattedComments);

        if (append) {
          setPostComments(prev => [...prev, ...formattedComments]);
        } else {
          setPostComments(formattedComments);
        }

        // Update hasMoreComments based on the actual data count
        if (commentsData.length < commentsPerPage) {
          setHasMoreComments(false);
        }
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setCommentError('Failed to load comments');
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleShowComments = async () => {
    const shouldFetch = !showComments && postComments.length === 0;
    setShowComments(!showComments);

    if (shouldFetch) {
      try {
        await fetchComments(1, false);
      } catch (error) {
        console.error('Error loading comments:', error);
        setCommentError('Failed to load comments');
      }
    }
  };

  const handleLoadMoreComments = () => {
    if (!isLoadingComments && hasMoreComments) {
      const nextPage = commentPage + 1;
      setCommentPage(nextPage);
      fetchComments(nextPage, true);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!commentText.trim() || !currentUser || !_id) {
    console.error('Missing required fields for adding comment:', {
      commentText,
      currentUser: !!currentUser,
      postId: _id
    });
    return;
  }

  try {
    setIsLoading(true);
    setCommentError(null);

    console.log('Adding comment to post:', _id);
    const response = await postsAPI.addComment(_id, { content: commentText });
    console.log('Comment added successfully:', response);

    if (response.data) {
      const newComment = {
        _id: response.data._id || Date.now().toString(), // Fallback to timestamp if no ID
        text: response.data.content || commentText,
        createdAt: response.data.createdAt || new Date().toISOString(),
        user: {
          _id: currentUser.id,
          username: currentUser.username || 'user',
          name: currentUser.fullName || 'User',
          avatar: currentUser.avatar || DEFAULT_AVATAR
        }
      };

      setPostComments(prev => [newComment, ...prev]);
      setCommentText('');
      onUpdate?.(_id);
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    setCommentError('Failed to add comment');
  } finally {
    setIsLoading(false);
  }
};

  const handleDeletePost = async () => {
    if (!currentUser || user._id !== currentUser.id) return;
    try {
      setIsLoading(true);
      await postsAPI.deletePost(_id);
      onDelete?.(_id);
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsLoading(false);
      handleMenuClose();
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const isPostOwner = currentUser && user?._id === currentUser.id;

  return (
    <Card
      sx={{
        maxWidth: 500,
        margin: "auto",
        borderRadius: 3,
        boxShadow: 3,
        backgroundColor: "#fff",
        mb: 3,
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            src={currentAvatar}
            alt={user?.name || "User"}
            onError={handleAvatarError}
          />
        }
        action={
          <IconButton onClick={handleMenuOpen} disabled={isLoading}>
            <MoreVertIcon />
          </IconButton>
        }
        title={<Typography fontWeight={600}>{user?.username}</Typography>}
        subheader={
          <Typography variant="caption" color="text.secondary">
            {formatTimeAgo(createdAt)}
          </Typography>
        }
      />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {isPostOwner ? (
          <>
            <MenuItem onClick={handleMenuClose}>
              <EditIcon sx={{ mr: 1 }} /> Edit Post
            </MenuItem>
            <MenuItem onClick={handleDeletePost} sx={{ color: "error.main" }}>
              <DeleteIcon sx={{ mr: 1 }} /> Delete Post
            </MenuItem>
          </>
        ) : (
          <MenuItem onClick={handleMenuClose}>Report</MenuItem>
        )}
      </Menu>

      <Box sx={{ position: "relative", width: "100%", height: 500, bgcolor: "#f5f5f5" }}>
        {isImageLoading && (
          <CircularProgress size={48} sx={{ position: "absolute", zIndex: 2 }} />
        )}
        <CardMedia
          component="img"
          image={isGooglePhotosUrl(currentImage) ? IMAGE_PLACEHOLDER : currentImage}
          alt={caption}
          onError={handleImageError}
          onLoad={handleImageLoad}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: isImageLoading ? 0 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        />
      </Box>

      <CardActions sx={{ justifyContent: "space-between" }}>
        <Box>
          <IconButton onClick={handleLike} disabled={isLoading}>
            {isLiked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
          </IconButton>
          <IconButton
            onClick={handleShowComments}
            disabled={isLoading}
            sx={{ color: showComments ? "primary.main" : "inherit" }}
          >
            <ChatBubbleOutlineIcon />
          </IconButton>
        </Box>
        <IconButton onClick={() => setIsBookmarked(!isBookmarked)}>
          {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        </IconButton>
      </CardActions>

      {showComments && (
        <Box sx={{ mt: 1, maxHeight: 300, overflowY: 'auto' }}>
          {postComments.length > 0 ? (
            <>
              {postComments.map((comment) => (
                <Box key={comment._id} sx={{ display: 'flex', mb: 1, p: 1, '&:hover': { bgcolor: 'action.hover' } }}>
                  <Avatar
                    src={comment.user.avatar}
                    alt={comment.user.username}
                    sx={{ width: 24, height: 24, mr: 1 }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, display: 'inline', mr: 1 }}>
                      {comment.user.username}
                    </Typography>
                    <Typography variant="body2" display="inline">
                      {comment.text}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {formatTimeAgo(comment.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {hasMoreComments && (
                <Button
                  onClick={handleLoadMoreComments}
                  disabled={isLoadingComments}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  {isLoadingComments ? 'Loading...' : 'Load more comments'}
                </Button>
              )}
            </>
          ) : !isLoadingComments ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
              No comments yet
            </Typography>
          ) : null}
          {isLoadingComments && postComments.length === 0 && (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          )}
          <Box
            component="form"
            onSubmit={handleAddComment}
            sx={{ display: "flex", alignItems: "center", mt: 1 }}
          >
            <Avatar
              src={currentUser?.avatar}
              alt={currentUser?.username}
              sx={{ width: 32, height: 32, mr: 1 }}
            />
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={isLoading || !currentUser}
              InputProps={{
                endAdornment: (
                  <IconButton
                    type="submit"
                    disabled={!commentText.trim() || isLoading}
                    color="primary"
                  >
                    <SendIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default Post;
