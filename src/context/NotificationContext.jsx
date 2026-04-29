import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const isSeller = user.role === 'seller' || user.role === 'creator';
      const endpointPrefix = isSeller ? '/notifications/seller' : '/notifications/user';
      
      const res = await axios.get(endpointPrefix);
      if (res.data.success) {
        setNotifications(res.data.data.notifications || res.data.data);
        setUnreadCount(res.data.data.unreadCount !== undefined ? res.data.data.unreadCount : (res.data.data.notifications || res.data.data).filter(n => !n.read).length);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      const isSeller = user.role === 'seller' || user.role === 'creator';
      const endpointPrefix = isSeller ? '/notifications/seller' : '/notifications/user';
      
      await axios.put(`${endpointPrefix}/mark-read/${id}`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const isSeller = user.role === 'seller' || user.role === 'creator';
      const endpointPrefix = isSeller ? '/notifications/seller' : '/notifications/user';
      
      await axios.put(`${endpointPrefix}/mark-all-read`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const isSeller = user.role === 'seller' || user.role === 'creator';
      const endpointPrefix = isSeller ? '/notifications/seller' : '/notifications/user';
      
      await axios.delete(`${endpointPrefix}/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      // If it was unread, decrement count
      const deletedNotification = notifications.find(n => n._id === id);
      if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
        notifications, 
        unreadCount, 
        loading, 
        markAsRead, 
        markAllAsRead, 
        deleteNotification,
        refresh: fetchNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
