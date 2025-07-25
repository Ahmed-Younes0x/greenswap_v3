import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotification();

  const getToastClass = (type) => {
    switch (type) {
      case 'success':
        return 'bg-success text-white';
      case 'error':
        return 'bg-danger text-white';
      case 'warning':
        return 'bg-warning text-dark';
      case 'info':
      default:
        return 'bg-info text-white';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return 'bi-check-circle';
      case 'error':
        return 'bi-exclamation-circle';
      case 'warning':
        return 'bi-exclamation-triangle';
      case 'info':
      default:
        return 'bi-info-circle';
    }
  };

  return (
    <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1055 }}>
      {notifications.slice(0, 5).map((notification) => (
        <div
          key={notification.id}
          className={`toast show ${getToastClass(notification.type)} mb-2`}
          role="alert"
        >
          <div className="toast-header">
            <i className={`bi ${getIcon(notification.type)} me-2`}></i>
            <strong className="me-auto">{notification.title}</strong>
            <small className="text-muted">
              {new Date(notification.timestamp).toLocaleTimeString('ar-EG')}
            </small>
            <button
              type="button"
              className="btn-close"
              onClick={() => removeNotification(notification.id)}
            ></button>
          </div>
          <div className="toast-body">
            {notification.message}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;