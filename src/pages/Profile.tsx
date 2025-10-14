import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';

interface User {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  website?: string;
  followers: number;
  following: number;
  posts: number;
  isFollowing?: boolean;
}

interface Post {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
}

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, postsRes] = await Promise.all([
          api.get(`/users/${username}`),
          api.get(`/users/${username}/posts`)
        ]);
        
        setProfile(profileRes.data);
        setPosts(postsRes.data);
        setIsCurrentUser(profileRes.data.id === currentUser?.id);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!profile) return;
    
    try {
      if (profile.isFollowing) {
        await api.delete(`/users/${profile.id}/unfollow`);
        setProfile(prev => prev ? {
          ...prev,
          isFollowing: false,
          followers: prev.followers - 1
        } : null);
      } else {
        await api.post(`/users/${profile.id}/follow`);
        setProfile(prev => prev ? {
          ...prev,
          isFollowing: true,
          followers: prev.followers + 1
        } : null);
      }
    } catch (error) {
      console.error('Failed to update follow status', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-700">User not found</h2>
        <p className="text-gray-500 mt-2">The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start px-4 py-8">
        {/* Profile Picture */}
        <div className="w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
          <img 
            src={profile.avatar || '/default-avatar.png'} 
            alt={profile.username}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Info */}
        <div className="mt-6 md:mt-0 md:ml-16 flex-1">
          <div className="flex flex-col md:flex-row md:items-center">
            <h1 className="text-2xl font-light">{profile.username}</h1>
            
            {isCurrentUser ? (
              <Link
                to="/accounts/edit"
                className="mt-2 md:mt-0 md:ml-4 px-4 py-1 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Edit Profile
              </Link>
            ) : (
              <button
                onClick={handleFollow}
                className={`mt-2 md:mt-0 md:ml-4 px-4 py-1 text-sm font-medium rounded-md ${
                  profile.isFollowing 
                    ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {profile.isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex space-x-8 my-4">
            <div>
              <span className="font-semibold">{profile.posts}</span> posts
            </div>
            <div>
              <span className="font-semibold">{profile.followers}</span> followers
            </div>
            <div>
              <span className="font-semibold">{profile.following}</span> following
            </div>
          </div>

          {/* Bio */}
          <div>
            <h2 className="font-semibold">{profile.fullName}</h2>
            {profile.bio && <p className="mt-1">{profile.bio}</p>}
            {profile.website && (
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {profile.website}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-gray-200">
        <div className="flex justify-center">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'posts' 
                ? 'text-blue-500 border-t-2 border-blue-500' 
                : 'text-gray-600'
            }`}
          >
            <i className="fas fa-th mr-1"></i> POSTS
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'saved' 
                ? 'text-blue-500 border-t-2 border-blue-500' 
                : 'text-gray-600'
            }`}
          >
            <i className="far fa-bookmark mr-1"></i> SAVED
          </button>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-1">
        {posts.length > 0 ? (
          posts.map(post => (
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
          ))
        ) : (
          <div className="col-span-3 py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full border-2 border-black flex items-center justify-center mb-4">
              <i className="fas fa-camera text-2xl"></i>
            </div>
            <h2 className="text-3xl font-light mb-2">No Posts Yet</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              {isCurrentUser ? 'Share your first photo to get started!' : 'When they post, you\'ll see their photos here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;