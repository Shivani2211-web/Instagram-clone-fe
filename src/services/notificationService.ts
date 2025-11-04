import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

export const getNotifications = async (page = 1, limit = 20) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/notifications`, {
    params: { page, limit },
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getUnreadCount = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data?.count || 0;
};

export const markAsRead = async (notificationIds: string[]) => {
  const token = localStorage.getItem('token');
  await axios.put(
    `${API_URL}/notifications/read`,
    { notificationIds },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const deleteNotifications = async (notificationIds: string[]) => {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { notificationIds }
  });
};