import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }
  };

  return (
    <div 
      className={`p-4 border-b border-gray-100 ${!notification.read ? 'bg-blue-50' : 'bg-white'} cursor-pointer`}
      onClick={handleClick}
    >
      <div className="flex items-start">
        <img 
          src={notification.sender?.avatar || '/default-avatar.png'} 
          alt={notification.sender?.username}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold">{notification.sender?.username || 'Someone'}</span>
              {' '}
              <span className="text-gray-600">
                {notification.type === 'like' && 'liked your post'}
                {notification.type === 'comment' && 'commented on your post'}
                {notification.type === 'follow' && 'started following you'}
                {notification.type === 'mention' && 'mentioned you'}
              </span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification._id);
              }}
              className="text-gray-400 hover:text-red-500"
            >
              ×
            </button>
          </div>
          {notification.comment && (
            <p className="text-gray-600 mt-1 ml-1 pl-4 border-l-2 border-gray-200">
              {typeof notification.comment === 'string' 
                ? notification.comment 
                : notification.comment.text}
            </p>
          )}
          <div className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;