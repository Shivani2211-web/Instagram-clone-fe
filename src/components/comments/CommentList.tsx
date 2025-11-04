import { useState, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Avatar, Divider } from '@mui/material';
import { Send as SendIcon, Favorite, FavoriteBorder } from '@mui/icons-material';
import { useComments } from '../../hooks/api/useComments';

interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  text: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
}

interface CommentListProps {
  postId: string;
  initialComments?: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ postId, initialComments = [] }) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const { addComment, likeComment, loading, error } = useComments();

  useEffect(() => {
    // If no initial comments are provided, fetch them
    if (initialComments.length === 0) {
      // Note: You'll need to implement fetchComments in useComments hook
      // fetchComments(postId).then(setComments).catch(console.error);
    }
  }, [postId, initialComments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const comment = await addComment({
        postId,
        text: newComment.trim(),
      });
      
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await likeComment(commentId);
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                isLiked: !comment.isLiked,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 
              } 
            : comment
        )
      );
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval}y`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval}mo`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval}d`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval}h`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval}m`;

    return 'Just now';
  };

  return (
    <Box>
      {/* Comment input */}
      <Box display="flex" alignItems="center" p={2}>
        <Avatar 
          sx={{ width: 32, height: 32, mr: 1 }}
          // Add user avatar here
        />
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              backgroundColor: 'background.paper',
              '& fieldset': {
                borderColor: 'divider',
              },
            },
          }}
        />
        <IconButton 
          onClick={handleAddComment} 
          disabled={!newComment.trim() || loading}
          color="primary"
          sx={{ ml: 1 }}
        >
          <SendIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Comments list */}
      <Box maxHeight={300} overflow="auto">
        {comments.length === 0 ? (
          <Box p={2} textAlign="center">
            <Typography variant="body2" color="textSecondary">
              No comments yet. Be the first to comment!
            </Typography>
          </Box>
        ) : (
          comments.map((comment) => (
            <Box key={comment.id} p={2}>
              <Box display="flex" alignItems="flex-start">
                <Avatar 
                  src={comment.userAvatar} 
                  alt={comment.username}
                  sx={{ width: 32, height: 32, mr: 1 }}
                />
                <Box flex={1}>
                  <Box 
                    sx={{ 
                      backgroundColor: 'background.paper', 
                      borderRadius: '18px',
                      p: 1.5,
                      display: 'inline-block',
                      maxWidth: '80%',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {comment.username}
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      {comment.text}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mt={0.5} ml={1}>
                    <Typography variant="caption" color="textSecondary" sx={{ mr: 2 }}>
                      {formatTimeAgo(comment.createdAt)}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="textSecondary" 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                        mr: 2
                      }}
                    >
                      {comment.likes} like{comment.likes !== 1 ? 's' : ''}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="textSecondary" 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      Reply
                    </Typography>
                  </Box>
                </Box>
                <IconButton 
                  size="small" 
                  onClick={() => handleLikeComment(comment.id)}
                  sx={{ ml: 1, alignSelf: 'flex-start' }}
                >
                  {comment.isLiked ? (
                    <Favorite color="error" fontSize="small" />
                  ) : (
                    <FavoriteBorder fontSize="small" />
                  )}
                </IconButton>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default CommentList;
