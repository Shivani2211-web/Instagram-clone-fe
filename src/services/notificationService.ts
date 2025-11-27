import api from '../api/api';

export const getNotifications = async (params: { page?: number; limit?: number; unread?: boolean } = {}) => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data.data?.count || 0;
};

/**
 * Mark notifications as read
 * @param notificationIds - Single notification ID as string or array of notification IDs
 */
export const markAsRead = async (notificationIds: string | string[]) => {
  if (Array.isArray(notificationIds)) {
    // Handle single notification ID
    await api.patch(`/notifications/${notificationIds}/read`);
  }
};

/**
 * Alias for marking a single notification as read
 * @deprecated Use markAsRead instead for consistency
 */
export const markNotificationAsRead = async (notificationId: string) => {
  return markAsRead(notificationId);
};

export const deleteNotifications = async (notificationIds: string[]) => {
  await api.delete('/notifications', { data: { notificationIds } });
};