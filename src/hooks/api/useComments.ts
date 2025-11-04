import { useState } from 'react';
import { commentsAPI } from '../../api/endpoints';

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
}

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentsAPI.getPostComments(postId);
      setComments(response.data);
    } catch (err) {
      setError('Failed to load comments');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (text: string) => {
    try {
      const response = await commentsAPI.addComment(postId, text);
      setComments(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError('Failed to add comment');
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await commentsAPI.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      setError('Failed to delete comment');
      console.error('Error deleting comment:', err);
      throw err;
    }
  };

  const toggleLike = async (commentId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await commentsAPI.unlikeComment(commentId);
      } else {
        await commentsAPI.likeComment(commentId);
      }
      
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                likes: isLiked ? comment.likes - 1 : comment.likes + 1,
                isLiked: !isLiked
              } 
            : comment
        )
      );
    } catch (err) {
      console.error('Error toggling comment like:', err);
      throw err;
    }
  };

  return {
    comments,
    loading,
    error,
    addComment,
    deleteComment,
    toggleLike,
    refreshComments: fetchComments
  };
};

export default useComments;
