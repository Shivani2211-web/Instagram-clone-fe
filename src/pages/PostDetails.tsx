import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';

interface User {
  id: string;
  username: string;
  avatar?: string;
}

interface Comment {
  id: string;
  user: User;
  text: string;
  createdAt: string;
}

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: Comment[];
  user: User;
  isLiked: boolean;
  createdAt: string;
}

const PostDetails = () => {
  const { postId } = useParams<{ postId: string }>();
  const { currentUser } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${postId}`);
        setPost(response.data);
      } catch (error) {
        console.error('Failed to fetch post', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handleLike = async () => {
    if (!post || !currentUser) return;
    
    try {
      setIsLiking(true);
      
      if (post.isLiked) {
        await api.delete(`/posts/${post.id}/unlike`);
        setPost(prev => prev ? {
          ...prev,
          isLiked: false,
          likes: prev.likes - 1
        } : null);
      } else {
        await api.post(`/posts/${post.id}/like`);
        setPost(prev => prev ? {
          ...prev,
          isLiked: true,
          likes: prev.likes + 1
        } : null);
      }
    } catch (error) {
      console.error('Failed to update like', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post) return;
    
    try {
      const response = await api.post(`/posts/${post.id}/comments`, {
        text: commentText
      });
      
      setPost(prev => prev ? {
        ...prev,
        comments: [response.data, ...prev.comments]
      } : null);
      
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-700">Post not found</h2>
        <p className="text-gray-500 mt-2">The post you're looking for doesn't exist or has been deleted.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="md:flex">
        {/* Post Image */}
        <div className="md:w-2/3 bg-black flex items-center justify-center">
          <img 
            src={post.imageUrl} 
            alt={post.caption} 
            className="w-full h-full object-contain max-h-[80vh]"
          />
        </div>
        
        {/* Post Details */}
        <div className="md:w-1/3 flex flex-col border-l border-gray-200">
          {/* User Header */}
          <div className="p-4 border-b border-gray-200 flex items-center">
            <Link 
              to={`/${post.user.username}`}
              className="flex items-center"
            >
              <div className="h-8 w-8 rounded-full overflow-hidden mr-3">
                <img 
                  src={post.user.avatar || '/default-avatar.png'} 
                  alt={post.user.username}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-semibold">{post.user.username}</span>
            </Link>
          </div>
          
          {/* Comments */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Caption */}
            <div className="flex">
              <Link 
                to={`/${post.user.username}`}
                className="font-semibold mr-2"
              >
                {post.user.username}
              </Link>
              <span>{post.caption}</span>
            </div>
            
            {/* Comments List */}
            {post.comments.length > 0 ? (
              post.comments.map(comment => (
                <div key={comment.id} className="flex">
                  <Link 
                    to={`/${comment.user.username}`}
                    className="font-semibold mr-2"
                  >
                    {comment.user.username}
                  </Link>
                  <span>{comment.text}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-4 mb-4">
              <button 
                onClick={handleLike}
                disabled={isLiking}
                className={`text-2xl ${post.isLiked ? 'text-red-500' : 'text-gray-700'}`}
              >
                <i className={`${post.isLiked ? 'fas' : 'far'} fa-heart`}></i>
              </button>
              <button className="text-2xl text-gray-700">
                <i className="far fa-comment"></i>
              </button>
              <button className="text-2xl text-gray-700">
                <i className="far fa-paper-plane"></i>
              </button>
            </div>
            
            {/* Likes Count */}
            <div className="font-semibold mb-2">
              {post.likes} {post.likes === 1 ? 'like' : 'likes'}
            </div>
            
            {/* Timestamp */}
            <div className="text-gray-400 text-xs mb-4">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            
            {/* Add Comment */}
            <form onSubmit={handleAddComment} className="flex items-center">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 border-none focus:ring-0 p-0 text-sm"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!commentText.trim()}
                className={`font-semibold text-sm ${commentText.trim() ? 'text-blue-500' : 'text-blue-300'}`}
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;