export interface Story {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  image: string;
  createdAt: string;
  expiresAt: string;
  isViewed?: boolean;
}

export interface StoryViewerProps {
  initialStoryId: string;
  onClose: () => void;
}
