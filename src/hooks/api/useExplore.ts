import { useState, useEffect } from 'react';
import { exploreAPI } from '../../api/endpoints';

export interface ExplorePost {
  id: string;
  image: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export interface SuggestedUser {
  id: string;
  username: string;
  avatar: string;
  isFollowing: boolean;
}

export const useExplore = () => {
  const [trendingPosts, setTrendingPosts] = useState<ExplorePost[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [hashtagPosts, setHashtagPosts] = useState<Record<string, ExplorePost[]>>({});
  const [loading, setLoading] = useState({
    trending: false,
    suggested: false,
    hashtag: false
  });
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingPosts = async (limit = 20) => {
    try {
      setLoading(prev => ({ ...prev, trending: true }));
      const response = await exploreAPI.getTrendingPosts(limit);
      setTrendingPosts(response.data);
    } catch (err) {
      setError('Failed to load trending posts');
      console.error('Error fetching trending posts:', err);
    } finally {
      setLoading(prev => ({ ...prev, trending: false }));
    }
  };

  const fetchSuggestedUsers = async (limit = 5) => {
    try {
      setLoading(prev => ({ ...prev, suggested: true }));
      const response = await exploreAPI.getSuggestedUsers(limit);
      setSuggestedUsers(response.data);
    } catch (err) {
      setError('Failed to load suggested users');
      console.error('Error fetching suggested users:', err);
    } finally {
      setLoading(prev => ({ ...prev, suggested: false }));
    }
  };

  const searchByHashtag = async (hashtag: string, limit = 20) => {
    try {
      setLoading(prev => ({ ...prev, hashtag: true }));
      const response = await exploreAPI.searchByHashtag(hashtag, 1, limit);
      
      setHashtagPosts(prev => ({
        ...prev,
        [hashtag]: response.data
      }));
      
      return response.data;
    } catch (err) {
      setError(`Failed to search for #${hashtag}`);
      console.error(`Error searching for hashtag ${hashtag}:`, err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, hashtag: false }));
    }
  };

  // Initial data load
  useEffect(() => {
    fetchTrendingPosts();
    fetchSuggestedUsers();
  }, []);

  return {
    trendingPosts,
    suggestedUsers,
    hashtagPosts,
    loading,
    error,
    fetchTrendingPosts,
    fetchSuggestedUsers,
    searchByHashtag
  };
};

export default useExplore;
