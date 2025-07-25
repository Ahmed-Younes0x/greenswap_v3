import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useAuth();

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      type: 'info',
      ...notification,
      timestamp: new Date()
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50
    setUnreadCount(prev => prev + 1);

    // Auto remove after 5 seconds for toast notifications
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Notification types
  const showSuccess = (message, title = 'نجح') => {
    addNotification({
      type: 'success',
      title,
      message
    });
  };

  const showError = (message, title = 'خطأ') => {
    addNotification({
      type: 'error',
      title,
      message
    });
  };

  const showWarning = (message, title = 'تحذير') => {
    addNotification({
      type: 'warning',
      title,
      message
    });
  };

  const showInfo = (message, title = 'معلومات') => {
    addNotification({
      type: 'info',
      title,
      message
    });
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};