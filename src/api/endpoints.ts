// src/api/endpoints.ts
import type { Story } from '../types/story';
import api from './api';

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`, true);
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { name: string; email: string; password: string }) =>
    api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

// Posts endpoints
export const postsAPI = {
  // Get all posts from users that the current user follows
  getAllPosts: () => api.get('/posts'),
  
  // Get single post by ID
  getPost: (id: string) => api.get(`/posts/${id}`),
  
  // Create a new post
  createPost: (postData: { 
    text: string; 
    image?: string; 
    location?: string;
  }) => api.post('/posts', postData),
  
  // Update a post
  updatePost: (postId: string, postData: {
    text?: string;
    image?: string;
    location?: string;
  }) => api.put(`/posts/${postId}`, postData),
  
  // Delete a post
  deletePost: (postId: string) => api.delete(`/posts/${postId}`),
  
  // Like a post
  likePost: (postId: string) => api.put(`/posts/like/${postId}`),
  
  // Unlike a post
  unlikePost: (postId: string) => api.put(`/posts/unlike/${postId}`),
  
  // Get comments for a post
  getPostComments: (postId: string, params?: { page?: number; limit?: number }) => 
    api.get(`/posts/${postId}/comments`, { params }),
  
  // Add a comment to a post
  addComment: (postId: string, comment: { content: string }) =>
    api.post(`/posts/${postId}/comments`, comment),
  
  // Delete a comment
  deleteComment: (commentId: string) =>
    api.delete(`/posts/${commentId}`),
};  

// Users endpoints
export const usersAPI = {
  // Get current user's profile
  getMe: () => api.get('/users/me'),
  
  // Get user profile by username
  getUserProfile: async (username: string) => {
    if (!username) {
      console.error('No username provided to getUserProfile');
      return Promise.reject(new Error('Username is required'));
    }
    
    try {
      // First try to get the user by ID
      const byIdResponse = await api.get(`/users/${username}`);
      return byIdResponse;
    } catch (idError) {
      try {
        // If that fails, try searching by username
        console.log(`Trying to fetch by search: /users/search?q=${username}`);
        const searchResponse = await api.get(`/users/search?q=${encodeURIComponent(username)}`);
        console.log('Response from search endpoint:', searchResponse);
        
        // If the search returns an array, take the first result
        if (Array.isArray(searchResponse.data)) {
          if (searchResponse.data.length > 0) {
            return { data: searchResponse.data[0] };
          }
          throw new Error('User not found');
        }
        return searchResponse;
      } catch (searchError) {
        console.error('Both ID and search endpoints failed:', {
          idError,
          searchError,
          username,
          timestamp: new Date().toISOString()
        });
        throw searchError; // Re-throw to be handled by the caller
      }
    }
  },
  
  // Get user profile by ID
  getUserProfileById: (userId: string) => api.get(`/users/profile/${userId}`),
  
  // Follow/unfollow
  followUser: (userId: string) => api.put(`/users/follow/${userId}`),
  unfollowUser: (userId: string) => api.put(`/users/unfollow/${userId}`),
  
  // Get user's posts
  getUserPosts: (userId: string) => api.get(`/users/posts/${userId}`),
  
  // Search users (returns array of users)
  searchUsers: (query: string) => api.get(`/users/search?q=${query}`).then(res => {
    // Ensure we always return an array
    if (Array.isArray(res.data)) {
      return res;
    }
    return { ...res, data: res.data ? [res.data] : [] };
  })
};
export const MESSAGES = {
  GET_CONVERSATIONS: '/messages/conversations/list',
  GET_CONVERSATION: (userId: string) => `/messages/${userId}`,
  SEND_MESSAGE: '/messages',
  MARK_AS_READ: '/messages/mark-read',
  GET_USER: (userId: string) => `/users/${userId}`,
};
// Upload endpoints
export const uploadAPI = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Stories endpoints
export const storiesAPI = {
  // Get stories for a specific user
  getUserStories: async (userId: string) => {
    try {
      console.log(`Fetching stories for user ${userId}...`);
      const response = await api.get(`/stories/feed`);
      console.log('User stories response:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching stories for user ${userId}:`, error);
      throw error;
    }
  },
  
  // Alias for getUserStories to maintain backward compatibility
  getFollowingStories: async (): Promise<Story[]> => {
    try {
      const response = await api.get('/stories/feed');
      return response.data;
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  },
  
  // Create a new story
  createStory: async (storyData: { image: string; expiresAt?: Date }) => {
    try {
      console.log('Creating story with data:', storyData);
      return await api.post('/stories', storyData);
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  },
  
  // Delete a story
  deleteStory: async (storyId: string) => {
    try {
      console.log(`Deleting story ${storyId}...`);
      return await api.delete(`/stories/${storyId}`);
    } catch (error) {
      console.error(`Error deleting story ${storyId}:`, error);
      throw error;
    }
  },
  
  // View a story (mark as viewed)
  viewStory: async (storyId: string) => {
    try {
      console.log(`Viewing story ${storyId}...`);
      return await api.put(`/stories/${storyId}/view`);
    } catch (error) {
      console.error(`Error viewing story ${storyId}:`, error);
      throw error;
    }
  }
};

// Comments endpoints
export const commentsAPI = {
  // Get comments for a post
  getPostComments: (postId: string) => api.get(`/posts/${postId}/comments`),
  
  // Add a comment to a post
  addComment: (postId: string, text: string) => 
    api.post(`/posts/${postId}/comments`, { text }),
  
  // Delete a comment
  deleteComment: (commentId: string) => 
    api.delete(`/comments/${commentId}`),
  
  // Like a comment
  likeComment: (commentId: string) => 
    api.post(`/comments/${commentId}/like`),
  
  // Unlike a comment
  unlikeComment: (commentId: string) => 
    api.delete(`/comments/${commentId}/like`)
};

// Notifications endpoints
export const notificationsAPI = {
  // Get user notifications
  getNotifications: () => api.get('/notifications'),
  
  // Mark notification as read
  markAsRead: (notificationId: string) => 
    api.patch(`/notifications/${notificationId}/read`),
  
  // Mark all notifications as read
  markAllAsRead: () => api.patch('/notifications/read-all'),
  
  // Get unread notifications count
  getUnreadCount: () => api.get('/notifications/unread-count')
};

// Explore endpoints
export const exploreAPI = {
  // Get trending posts
  getTrendingPosts: (limit = 20) => 
    api.get('/explore/trending', { params: { limit } }),
  
  // Search posts by hashtag
  searchByHashtag: (hashtag: string, page = 1, limit = 20) => 
    api.get('/explore/hashtag', { params: { hashtag, page, limit } }),
  
  // Get suggested users to follow
  getSuggestedUsers: (limit = 10) => 
    api.get('/explore/suggested-users', { params: { limit } })
};

// Bookmarks endpoints
export const bookmarksAPI = {
  // Get user's bookmarks
  getBookmarks: () => api.get('/bookmarks'),
  
  // Add post to bookmarks
  addBookmark: (postId: string) => 
    api.post('/bookmarks', { postId }),
  
  // Remove post from bookmarks
  removeBookmark: (postId: string) => 
    api.delete(`/bookmarks/${postId}`),
  
  // Check if post is bookmarked
  isBookmarked: (postId: string) => 
    api.get(`/bookmarks/check/${postId}`)
};

export default {
  auth: authAPI,
  posts: postsAPI,
  users: usersAPI,
  upload: uploadAPI,
  stories: storiesAPI,
  comments: commentsAPI,
  notifications: notificationsAPI,
  explore: exploreAPI,
  bookmarks: bookmarksAPI,
};