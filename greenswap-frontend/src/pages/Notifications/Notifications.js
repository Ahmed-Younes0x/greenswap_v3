import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import api from '../../utils/api';
import { formatDate } from '../../utils/helpers';

const Notifications = () => {
  const { showSuccess, showError } = useNotification();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?is_read=${filter === 'read'}` : '';
      const response = await api.get(`/notifications/${params}`);
      setNotifications(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showError('فشل في تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/notifications/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/mark-read/`);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      showSuccess('تم تحديد الإشعار كمقروء');
    } catch (error) {
      showError('فشل في تحديث الإشعار');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read/');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      showSuccess('تم تحديد جميع الإشعارات كمقروءة');
    } catch (error) {
      showError('فشل في تحديث الإشعارات');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}/delete/`);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      showSuccess('تم حذف الإشعار');
    } catch (error) {
      showError('فشل في حذف الإشعار');
    }
  };

  const clearAll = async () => {
    try {
      await api.delete('/notifications/clear-all/');
      setNotifications([]);
      showSuccess('تم حذف جميع الإشعارات');
    } catch (error) {
      showError('فشل في حذف الإشعارات');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      new_message: 'chat-dots',
      new_order: 'cart-plus',
      order_accepted: 'check-circle',
      order_rejected: 'x-circle',
      order_completed: 'check-all',
      item_liked: 'heart',
      item_rated: 'star',
      system: 'gear',
      promotion: 'gift'
    };
    return icons[type] || 'bell';
  };

  const getNotificationColor = (type) => {
    const colors = {
      new_message: 'primary',
      new_order: 'success',
      order_accepted: 'info',
      order_rejected: 'danger',
      order_completed: 'success',
      item_liked: 'danger',
      item_rated: 'warning',
      system: 'secondary',
      promotion: 'warning'
    };
    return colors[type] || 'primary';
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h2 className="fw-bold">الإشعارات</h2>
          <p className="text-muted">تابع جميع التحديثات والأنشطة</p>
        </div>
        <div className="col-md-4 text-md-end">
          <div className="btn-group" role="group">
            <button
              className="btn btn-outline-primary"
              onClick={markAllAsRead}
            >
              <i className="bi bi-check-all me-2"></i>
              تحديد الكل كمقروء
            </button>
            <button
              className="btn btn-outline-danger"
              onClick={clearAll}
            >
              <i className="bi bi-trash me-2"></i>
              حذف الكل
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card bg-primary text-white border-0">
            <div className="card-body text-center">
              <i className="bi bi-bell" style={{ fontSize: '2rem' }}></i>
              <h4 className="mt-2 mb-1">{stats.total_notifications || 0}</h4>
              <p className="mb-0 small">إجمالي الإشعارات</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card bg-warning text-white border-0">
            <div className="card-body text-center">
              <i className="bi bi-bell-fill" style={{ fontSize: '2rem' }}></i>
              <h4 className="mt-2 mb-1">{stats.unread_notifications || 0}</h4>
              <p className="mb-0 small">غير مقروءة</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card bg-success text-white border-0">
            <div className="card-body text-center">
              <i className="bi bi-check-circle" style={{ fontSize: '2rem' }}></i>
              <h4 className="mt-2 mb-1">{stats.read_notifications || 0}</h4>
              <p className="mb-0 small">مقروءة</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card bg-info text-white border-0">
            <div className="card-body text-center">
              <i className="bi bi-clock" style={{ fontSize: '2rem' }}></i>
              <h4 className="mt-2 mb-1">{stats.recent_notifications_count || 0}</h4>
              <p className="mb-0 small">خلال 24 ساعة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="btn-group" role="group">
            <input
              type="radio"
              className="btn-check"
              name="filter"
              id="filter-all"
              checked={filter === 'all'}
              onChange={() => setFilter('all')}
            />
            <label className="btn btn-outline-primary" htmlFor="filter-all">
              جميع الإشعارات
            </label>

            <input
              type="radio"
              className="btn-check"
              name="filter"
              id="filter-unread"
              checked={filter === 'unread'}
              onChange={() => setFilter('unread')}
            />
            <label className="btn btn-outline-warning" htmlFor="filter-unread">
              غير مقروءة
            </label>

            <input
              type="radio"
              className="btn-check"
              name="filter"
              id="filter-read"
              checked={filter === 'read'}
              onChange={() => setFilter('read')}
            />
            <label className="btn btn-outline-success" htmlFor="filter-read">
              مقروءة
            </label>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner centered text="جاري تحميل الإشعارات..." />
          ) : notifications.length > 0 ? (
            <div className="list-group list-group-flush">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`list-group-item list-group-item-action ${!notification.is_read ? 'bg-light border-start border-primary border-3' : ''}`}
                >
                  <div className="d-flex align-items-start">
                    <div className={`bg-${getNotificationColor(notification.notification_type)} bg-opacity-10 rounded-circle p-2 me-3`}>
                      <i className={`bi bi-${getNotificationIcon(notification.notification_type)} text-${getNotificationColor(notification.notification_type)}`}></i>
                    </div>
                    
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="mb-0 fw-bold">{notification.title}</h6>
                        <small className="text-muted">{notification.time_ago}</small>
                      </div>
                      
                      <p className="mb-2 text-muted">{notification.message}</p>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          {notification.sender && (
                            <div className="d-flex align-items-center">
                              <img
                                src={notification.sender.avatar_url || '/api/placeholder/24/24'}
                                alt={notification.sender.full_name}
                                className="rounded-circle me-2"
                                width="24"
                                height="24"
                              />
                              <small className="text-muted">من: {notification.sender.full_name}</small>
                            </div>
                          )}
                        </div>
                        
                        <div className="btn-group btn-group-sm">
                          {!notification.is_read && (
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => markAsRead(notification.id)}
                              title="تحديد كمقروء"
                            >
                              <i className="bi bi-check"></i>
                            </button>
                          )}
                          
                          {notification.action_url && (
                            <a
                              href={notification.action_url}
                              className="btn btn-outline-info"
                              title="عرض التفاصيل"
                            >
                              <i className="bi bi-eye"></i>
                            </a>
                          )}
                          
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => deleteNotification(notification.id)}
                            title="حذف"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-bell-slash text-muted" style={{ fontSize: '4rem' }}></i>
              <h5 className="mt-3 text-muted">لا توجد إشعارات</h5>
              <p className="text-muted">
                {filter === 'unread' 
                  ? 'لا توجد إشعارات غير مقروءة'
                  : filter === 'read'
                  ? 'لا توجد إشعارات مقروءة'
                  : 'لم تتلق أي إشعارات بعد'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;