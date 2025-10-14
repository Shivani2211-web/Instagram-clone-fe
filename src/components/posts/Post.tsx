import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  IconButton, 
  Card, 
  CardHeader, 
  CardMedia, 
  CardContent, 
  CardActions,
  TextField,
  Divider,
  Button
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon, 
  FavoriteBorder as LikeIcon, 
  ChatBubbleOutline as CommentIcon, 
  SendOutlined as SendIcon, 
  BookmarkBorder as SaveIcon,
  Favorite as LikedIcon,
  SentimentSatisfiedAlt as EmojiIcon
} from '@mui/icons-material';

interface PostProps {
  username: string;
  userAvatar: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

const Post = ({
  username,
  userAvatar,
  image,
  caption,
  likes,
  comments,
  timestamp,
  isLiked = false,
  isSaved = false
}: PostProps) => {
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [postLikes, setPostLikes] = useState(likes);

  const handleLike = () => {
    setLiked(!liked);
    setPostLikes(liked ? postLikes - 1 : postLikes + 1);
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      // Handle comment submission
      console.log('Comment submitted:', comment);
      setComment('');
    }
  };

  return (
    <Card elevation={0} sx={{ mb: 4, border: '1px solid #dbdbdb', borderRadius: 2, maxWidth: 600, mx: 'auto' }}>
      {/* Post Header */}
      <CardHeader
        avatar={
          <Avatar 
            src={userAvatar} 
            alt={username}
            sx={{ width: 32, height: 32 }}
          />
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={username}
        titleTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
        sx={{ p: 2, pb: 1 }}
      />

      {/* Post Image */}
      <CardMedia
        component="img"
        image={image}
        alt="Post"
        onDoubleClick={handleLike}
        sx={{ 
          width: '100%', 
          aspectRatio: '1', 
          objectFit: 'cover',
          cursor: 'pointer'
        }}
      />

      {/* Post Actions */}
      <CardActions sx={{ px: 2, py: 1 }}>
        <Box display="flex" width="100%" justifyContent="space-between">
          <Box>
            <IconButton onClick={handleLike} size="small">
              {liked ? 
                <LikedIcon color="error" fontSize="medium" /> : 
                <LikeIcon fontSize="medium" />
              }
            </IconButton>
            <IconButton size="small" onClick={() => setShowComments(!showComments)}>
              <CommentIcon fontSize="medium" />
            </IconButton>
            <IconButton size="small">
              <SendIcon fontSize="medium" />
            </IconButton>
          </Box>
          <IconButton onClick={handleSave} size="small">
            <SaveIcon fontSize="medium" sx={{ opacity: saved ? 1 : 0.7 }} />
          </IconButton>
        </Box>
      </CardActions>

      {/* Likes */}
      <CardContent sx={{ py: 0, px: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
          {postLikes.toLocaleString()} likes
        </Typography>
        
        {/* Caption */}
        <Typography variant="body2" sx={{ mb: 1 }}>
          <Box component="span" fontWeight={600} mr={1}>{username}</Box>
          {caption}
        </Typography>

        {/* View Comments */}
        {comments > 0 && !showComments && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => setShowComments(true)}
          >
            View all {comments} comments
          </Typography>
        )}

        {/* Timestamp */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {timestamp}
        </Typography>
      </CardContent>

      {/* Comments Section */}
      {showComments && (
        <Box sx={{ px: 2, py: 1 }}>
          <Divider sx={{ mb: 1 }} />
          {/* Add comments list here */}
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
            No comments yet
          </Typography>
        </Box>
      )}

      {/* Add Comment */}
      <Box component="form" onSubmit={handleCommentSubmit} sx={{ p: 2, pt: 0 }}>
        <Box display="flex" alignItems="center">
          <TextField
            fullWidth
            variant="standard"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <IconButton size="small" sx={{ mr: 1 }}>
                  <EmojiIcon fontSize="small" />
                </IconButton>
              ),
              sx: { 
                fontSize: '0.875rem',
                '& input': { py: 1 }
              }
            }}
          />
          <Button 
            type="submit" 
            color="primary" 
            disabled={!comment.trim()}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              color: comment.trim() ? '#0095f6' : '#b2dffc',
              minWidth: 'auto',
              p: 1
            }}
          >
            Post
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default Post;
