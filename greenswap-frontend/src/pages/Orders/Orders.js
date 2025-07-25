import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import {api} from '../../services/api'; // Assuming you have a configured axios instance


const Orders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({});
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'all' ? `?type=${activeTab}` : '';
      const response = await api.get(`/orders/my-orders/${params}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${token}`
          }
        }
      );
      setOrders(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError('فشل في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/orders/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleOrderAction = async (orderId, action) => {
    try {
      await api.post(`/orders/${orderId}/${action}/`);
      
      const actionMessages = {
        accept: 'تم قبول الطلب',
        reject: 'تم رفض الطلب',
        complete: 'تم إكمال الطلب',
        cancel: 'تم إلغاء الطلب'
      };
      
      showSuccess(actionMessages[action]);
      fetchOrders();
    } catch (error) {
      console.error(`Error ${action} order:`, error);
      showError(error.response?.data?.error || `فشل في ${action} الطلب`);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-warning', text: 'قيد الانتظار', icon: 'clock' },
      accepted: { class: 'bg-info', text: 'مقبول', icon: 'check-circle' },
      rejected: { class: 'bg-danger', text: 'مرفوض', icon: 'x-circle' },
      in_progress: { class: 'bg-primary', text: 'قيد التنفيذ', icon: 'arrow-repeat' },
      completed: { class: 'bg-success', text: 'مكتمل', icon: 'check-all' },
      cancelled: { class: 'bg-secondary', text: 'ملغي', icon: 'x' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`badge ${config.class}`}>
        <i className={`bi bi-${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-warning', text: 'قيد الانتظار' },
      paid: { class: 'bg-success', text: 'مدفوع' },
      refunded: { class: 'bg-info', text: 'مسترد' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { key: 'all', label: 'جميع الطلبات', icon: 'list' },
    { key: 'buying', label: 'طلبات الشراء', icon: 'cart' },
    { key: 'selling', label: 'طلبات البيع', icon: 'shop' }
  ];

  return (
    <div className="container py-5 page-container">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h2 className="fw-bold">إدارة الطلبات</h2>
          <p className="text-muted">تتبع وإدارة جميع طلباتك</p>
        </div>
        <div className="col-md-4 text-md-end">
          <Link to="/items" className="btn btn-primary">
            <i className="bi bi-plus-lg me-2"></i>
            تصفح المنتجات
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card gradient-bg-1 text-white border-0 hover-lift-lg">
            <div className="card-body text-center">
              <i className="bi bi-cart-check" style={{ fontSize: '2.5rem' }}></i>
              <h4 className="mt-2 mb-1">{stats.buying?.total_orders || 0}</h4>
              <p className="mb-0 small">إجمالي المشتريات</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card gradient-bg-4 text-white border-0 hover-lift-lg">
            <div className="card-body text-center">
              <i className="bi bi-shop" style={{ fontSize: '2.5rem' }}></i>
              <h4 className="mt-2 mb-1">{stats.selling?.total_sales || 0}</h4>
              <p className="mb-0 small">إجمالي المبيعات</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card gradient-bg-3 text-white border-0 hover-lift-lg">
            <div className="card-body text-center">
              <i className="bi bi-currency-exchange" style={{ fontSize: '2.5rem' }}></i>
              <h4 className="mt-2 mb-1">{stats.buying?.total_spent || 0} جنيه</h4>
              <p className="mb-0 small">إجمالي المصروفات</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card gradient-bg-5 text-white border-0 hover-lift-lg">
            <div className="card-body text-center">
              <i className="bi bi-cash-stack" style={{ fontSize: '2.5rem' }}></i>
              <h4 className="mt-2 mb-1">{stats.selling?.total_earned || 0} جنيه</h4>
              <p className="mb-0 small">إجمالي الأرباح</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card glass-card border-0">
        <div className="card-header bg-white">
          <ul className="nav nav-tabs card-header-tabs">
            {tabs.map(tab => (
              <li key={tab.key} className="nav-item">
                <button
                  className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <i className={`bi bi-${tab.icon} me-2`}></i>
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">جاري التحميل...</span>
              </div>
              <p className="mt-3 text-muted">جاري تحميل الطلبات...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="row">
              {orders.map(order => (
                <div key={order.id} className="col-lg-6 mb-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0 fw-bold">طلب #{order.order_number}</h6>
                        <small className="text-muted">{formatDate(order.created_at)}</small>
                      </div>
                      <div className="text-end">
                        {getStatusBadge(order.status)}
                        <div className="mt-1">
                          {getPaymentStatusBadge(order.payment_status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      {/* Item Info */}
                      <div className="d-flex mb-3">
                        <img
                          src={order.item.primary_image || 'http://localhost:8000/media/items/placeholder.png'}
                          alt={order.item.title}
                          className="rounded me-3"
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-bold">{order.item.title}</h6>
                          <p className="text-muted small mb-1">
                            الكمية: {order.quantity} × {order.unit_price} جنيه
                          </p>
                          <p className="text-primary fw-bold mb-0">
                            الإجمالي: {order.total_price} جنيه
                          </p>
                        </div>
                      </div>

                      {/* Participants */}
                      <div className="row mb-3">
                        <div className="col-6">
                          <small className="text-muted">المشتري:</small>
                          <div className="d-flex align-items-center">
                            <img
                              src={order.buyer.avatar_url || 'http://localhost:8000/media/avatar/placeholder.png'}
                              alt={order.buyer.full_name}
                              className="rounded-circle me-2"
                              width="24"
                              height="24"
                            />
                            <span className="small">{order.buyer.full_name}</span>
                          </div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">البائع:</small>
                          <div className="d-flex align-items-center">
                            <img
                              src={order.seller.avatar_url || 'http://localhost:8000/media/avatar/placeholder.png'}
                              alt={order.seller.full_name}
                              className="rounded-circle me-2"
                              width="24"
                              height="24"
                            />
                            <span className="small">{order.seller.full_name}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Info */}
                      {order.delivery_address && (
                        <div className="mb-3">
                          <small className="text-muted">عنوان التسليم:</small>
                          <p className="small mb-0">{order.delivery_address}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="d-flex gap-2 flex-wrap">
                        <Link
                          to={`/orders/${order.id}`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          <i className="bi bi-eye me-1"></i>
                          التفاصيل
                        </Link>

                        {order.can_accept && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleOrderAction(order.id, 'accept')}
                          >
                            <i className="bi bi-check-lg me-1"></i>
                            قبول
                          </button>
                        )}

                        {order.can_reject && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleOrderAction(order.id, 'reject')}
                          >
                            <i className="bi bi-x-lg me-1"></i>
                            رفض
                          </button>
                        )}

                        {order.can_complete && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleOrderAction(order.id, 'complete')}
                          >
                            <i className="bi bi-check-all me-1"></i>
                            إكمال
                          </button>
                        )}

                        {order.can_cancel && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleOrderAction(order.id, 'cancel')}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            إلغاء
                          </button>
                        )}

                        <Link
                          to={`/chat?order=${order.id}`}
                          className="btn btn-outline-info btn-sm"
                        >
                          <i className="bi bi-chat-dots me-1"></i>
                          محادثة
                        </Link>
                      </div>
                    </div>

                    {/* Timeline */}
                    {(order.accepted_at || order.completed_at) && (
                      <div className="card-footer bg-light">
                        <small className="text-muted">التسلسل الزمني:</small>
                        <div className="mt-2">
                          <div className="d-flex align-items-center mb-1">
                            <i className="bi bi-circle-fill text-primary me-2" style={{ fontSize: '0.5rem' }}></i>
                            <small>تم إنشاء الطلب: {formatDate(order.created_at)}</small>
                          </div>
                          {order.accepted_at && (
                            <div className="d-flex align-items-center mb-1">
                              <i className="bi bi-circle-fill text-success me-2" style={{ fontSize: '0.5rem' }}></i>
                              <small>تم القبول: {formatDate(order.accepted_at)}</small>
                            </div>
                          )}
                          {order.completed_at && (
                            <div className="d-flex align-items-center">
                              <i className="bi bi-circle-fill text-info me-2" style={{ fontSize: '0.5rem' }}></i>
                              <small>تم الإكمال: {formatDate(order.completed_at)}</small>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-inbox text-muted" style={{ fontSize: '4rem' }}></i>
              <h4 className="mt-3 text-muted">لا توجد طلبات</h4>
              <p className="text-muted">
                {activeTab === 'buying' 
                  ? 'لم تقم بأي طلبات شراء بعد'
                  : activeTab === 'selling'
                  ? 'لا توجد طلبات على منتجاتك'
                  : 'لا توجد طلبات'
                }
              </p>
              <Link to="/items" className="btn btn-primary">
                <i className="bi bi-search me-2"></i>
                تصفح المنتجات
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;