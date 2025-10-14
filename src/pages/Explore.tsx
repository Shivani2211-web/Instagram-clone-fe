import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Post {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
}

const Explore = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch posts from your API
    const fetchExplorePosts = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API call
        const mockPosts = Array.from({ length: 15 }, (_, i) => ({
          id: `post-${i + 1}`,
          imageUrl: `https://source.unsplash.com/random/300x300?${Math.floor(Math.random() * 1000)}`,
          likes: Math.floor(Math.random() * 1000),
          comments: Math.floor(Math.random() * 100),
        }));
        
        setPosts(mockPosts);
      } catch (error) {
        console.error('Failed to fetch explore posts', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExplorePosts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-light mb-6 px-4">Explore</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
        {posts.map((post) => (
          <Link 
            key={post.id} 
            to={`/p/${post.id}`}
            className="aspect-square bg-gray-100 relative group"
          >
            <img 
              src={post.imageUrl} 
              alt="" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center text-white font-semibold mr-6">
                <i className="fas fa-heart mr-1"></i>
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center text-white font-semibold">
                <i className="fas fa-comment mr-1"></i>
                <span>{post.comments}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Explore;
