import { useState, useEffect, useCallback } from 'react';
import { bookmarksAPI } from '../../api/endpoints';

export interface Bookmark {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
  post: {
    id: string;
    image: string;
    likes: number;
    comments: number;
  };
}

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookmarksAPI.getBookmarks();
      setBookmarks(response.data);
    } catch (err) {
      setError('Failed to load bookmarks');
      console.error('Error fetching bookmarks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const isBookmarked = useCallback(async (postId: string) => {
    try {
      const response = await bookmarksAPI.isBookmarked(postId);
      return response.data.isBookmarked;
    } catch (err) {
      console.error('Error checking if post is bookmarked:', err);
      return false;
    }
  }, []);

  const addBookmark = async (postId: string) => {
    try {
      const response = await bookmarksAPI.addBookmark(postId);
      await fetchBookmarks(); // Refresh bookmarks
      return response.data;
    } catch (err) {
      setError('Failed to add bookmark');
      console.error('Error adding bookmark:', err);
      throw err;
    }
  };

  const removeBookmark = async (postId: string) => {
    try {
      await bookmarksAPI.removeBookmark(postId);
      setBookmarks(prev => prev.filter(bookmark => bookmark.postId !== postId));
    } catch (err) {
      setError('Failed to remove bookmark');
      console.error('Error removing bookmark:', err);
      throw err;
    }
  };

  const toggleBookmark = async (postId: string, isCurrentlyBookmarked: boolean) => {
    if (isCurrentlyBookmarked) {
      await removeBookmark(postId);
    } else {
      await addBookmark(postId);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return {
    bookmarks,
    loading,
    error,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    refreshBookmarks: fetchBookmarks
  };
};

export default useBookmarks;
