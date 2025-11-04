import { useState, useEffect, useCallback } from 'react';
import { storiesAPI } from '../../api/endpoints';
import type { Story } from '../../types/story';

// Default avatar URL
const DEFAULT_AVATAR = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

// Mock data for development
const MOCK_STORIES: Story[] = [
  {
    id: '1',
    userId: 'user1',
    username: 'john_doe',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    image: 'https://picsum.photos/400/800?random=1',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 23).toISOString(),
    isViewed: false,
  },
];

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState<boolean>(false);

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      
      // In development or if explicitly using mock data
      if (import.meta.env.MODE === 'development' || localStorage.getItem('useMockData') === 'true') {
        console.log('Using mock stories data');
        setStories(MOCK_STORIES);
        setUsingMockData(true);
        return;
      }
      
      // First try to fetch from the API
      try {
        console.log('Attempting to fetch stories from API...');
        
        // Get current user's ID from localStorage or context
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId = currentUser?._id || currentUser?.id;
        
        if (!currentUserId) {
          console.log('No current user found, using mock data');
          setStories(MOCK_STORIES);
          setUsingMockData(true);
          return;
        }
        
        // Fetch stories for the current user
        const response = await storiesAPI.getUserStories(currentUserId);
        console.log('Stories API Response:', response);
        
        // Handle different response formats
        let storiesData = [];
        if (response.data) {
          // Handle different possible response structures
          storiesData = Array.isArray(response.data) 
            ? response.data 
            : response.data.data || [];
        }
        
        if (storiesData && storiesData.length > 0) {
          console.log(`Successfully fetched ${storiesData.length} stories`);
          // Ensure all stories have a valid avatar URL
          const storiesWithDefaultAvatars = storiesData.map((story: Story) => ({
            ...story,
            userAvatar: story.userAvatar || DEFAULT_AVATAR
          }));
          setStories(storiesWithDefaultAvatars);
          setUsingMockData(false);
        } else {
          console.log('No stories found, using mock data');
          setStories(MOCK_STORIES);
          setUsingMockData(true);
        }
      } catch (apiError) {
        console.error('Error fetching stories from API, falling back to mock data:', apiError);
        // In production, you might want to show a toast notification here
        setStories(MOCK_STORIES.map((story: Story) => ({
          ...story,
          userAvatar: story.userAvatar || DEFAULT_AVATAR
        })));
        setUsingMockData(true);
        // Optionally store preference to use mock data
        localStorage.setItem('useMockData', 'true');
      }
    } catch (err) {
      setError('Failed to load stories');
      console.error('Error in fetchStories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createStory = async (imageFile: File) => {
    try {
      setLoading(true);
      
      // First upload the image file
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Upload the image and get the URL
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const uploadResponse = await fetch(`${apiUrl}/api/v1/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      
      const { url: imageUrl } = await uploadResponse.json();
      
      // Now create the story with the image URL
      const storyResponse = await storiesAPI.createStory({
        image: imageUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      });
      
      // Refresh stories
      await fetchStories();
      return storyResponse.data;
    } catch (err) {
      setError('Failed to create story');
      console.error('Error creating story:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const viewStory = async (storyId: string) => {
    try {
      // Update local state optimistically
      setStories(prev => 
        prev.map(story => 
          story.id === storyId 
            ? { ...story, isViewed: true } 
            : story
        )
      );
      
      if (!usingMockData) {
        try {
          // Only try to call the API if we're not using mock data
          await storiesAPI.viewStory(storyId);
          // Refresh stories to ensure consistency
          await fetchStories();
        } catch (apiError) {
          console.warn('Failed to update story view on server:', apiError);
          // Continue with local state update even if API fails
        }
      }
    } catch (err) {
      console.error('Error in viewStory:', err);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return {
    stories,
    loading,
    error,
    createStory,
    viewStory,
    refreshStories: fetchStories
  };
};

export default useStories;
