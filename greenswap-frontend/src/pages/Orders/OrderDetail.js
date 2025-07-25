import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import {api} from '../../services/api'; // Assuming you have a configured axios instance

const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [tracking, setTracking] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [newRating, setNewRating] = useState({
    rating: 5,
    comment: ''
  });
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchOrderDetails();
    fetchMessages();
    fetchTracking();
    fetchRatings();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/orders/${id}/`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      showError('فشل في تحميل تفاصيل الطلب');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/orders/${id}/messages/`);
      setMessages(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchTracking = async () => {
    try {
      const response = await api.get(`/orders/${id}/tracking/`);
      setTracking(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching tracking:', error);
    }
  };

  const fetchRatings = async () => {
    try {
      const response = await api.get(`/orders/${id}/rating/`);
      setRatings(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleOrderAction = async (action) => {
    try {
      await api.post(`/orders/${id}/${action}/`);
      
      const actionMessages = {
        accept: 'تم قبول الطلب',
        reject: 'تم رفض الطلب',
        complete: 'تم إكمال الطلب',
        cancel: 'تم إلغاء الطلب'
      };
      
      showSuccess(actionMessages[action]);
      fetchOrderDetails();
      fetchTracking();
    } catch (error) {
      console.error(`Error ${action} order:`, error);
      showError(error.response?.data?.error || `فشل في ${action} الطلب`);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post(`/orders/${id}/messages/`, {
        message: newMessage.trim()
      });

      setNewMessage('');
      fetchMessages();
      showSuccess('تم إرسال الرسالة');
    } catch (error) {
      console.error('Error sending message:', error);
      showError('فشل في إرسال الرسالة');
    }
  };

  const submitRating = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/orders/${id}/rating/`, newRating);
      
      setShowRatingModal(false);
      setNewRating({ rating: 5, comment: '' });
      fetchRatings();
      showSuccess('تم إرسال التقييم بنجاح');
    } catch (error) {
      console.error('Error submitting rating:', error);
      showError('فشل في إرسال التقييم');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner centered text="جاري تحميل تفاصيل الطلب..." />;
  }

  if (!order) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
          <h3 className="mt-3">الطلب غير موجود</h3>
          <p className="text-muted">قد يكون الطلب محذوف أو غير متاح</p>
          <Link to="/orders" className="btn btn-primary">
            <i className="bi bi-arrow-right me-2"></i>
            العودة للطلبات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h2 className="fw-bold">طلب #{order.order_number}</h2>
          <p className="text-muted">تفاصيل الطلب وحالة التنفيذ</p>
        </div>
        <div className="col-md-4 text-md-end">
          <div className="d-flex gap-2 justify-content-md-end">
            {getStatusBadge(order.status)}
            <span className="badge bg-secondary">{order.payment_status}</span>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <img
                    src={order.item.primary_image || '/placeholder-image.jpg'}
                    alt={order.item.title}
                    className="img-fluid rounded"
                    style={{ height: '200px', width: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="col-md-8">
                  <h5 className="fw-bold mb-3">{order.item.title}</h5>
                  
                  <div className="row mb-3">
                    <div className="col-6">
                      <strong>الكمية:</strong>
                      <span className="ms-2">{order.quantity}</span>
                    </div>
                    <div className="col-6">
                      <strong>سعر الوحدة:</strong>
                      <span className="ms-2">{order.unit_price} جنيه</span>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-6">
                      <strong>المبلغ الإجمالي:</strong>
                      <span className="text-primary fw-bold ms-2">{order.total_price} جنيه</span>
                    </div>
                    <div className="col-6">
                      <strong>تاريخ الطلب:</strong>
                      <span className="ms-2">{formatDate(order.created_at)}</span>
                    </div>
                  </div>

                  {order.delivery_address && (
                    <div className="mb-3">
                      <strong>عنوان التسليم:</strong>
                      <p className="text-muted mb-0 mt-1">{order.delivery_address}</p>
                    </div>
                  )}

                  {order.buyer_notes && (
                    <div className="mb-3">
                      <strong>ملاحظات المشتري:</strong>
                      <p className="text-muted mb-0 mt-1">{order.buyer_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light">
              <h6 className="mb-0 fw-bold">أطراف الطلب</h6>
            </div>
            <div className="card-body">
              {/* Buyer */}
              <div className="mb-3">
                <small className="text-muted">المشتري:</small>
                <div className="d-flex align-items-center mt-1">
                  <img
                    src={order.buyer.avatar_url || '/default-avatar.png'}
                    alt={order.buyer.full_name}
                    className="rounded-circle me-2"
                    width="40"
                    height="40"
                  />
                  <div>
                    <h6 className="mb-0">{order.buyer.full_name}</h6>
                    <small className="text-muted">{order.buyer.email}</small>
                  </div>
                </div>
              </div>

              {/* Seller */}
              <div className="mb-3">
                <small className="text-muted">البائع:</small>
                <div className="d-flex align-items-center mt-1">
                  <img
                    src={order.seller.avatar_url || '/default-avatar.png'}
                    alt={order.seller.full_name}
                    className="rounded-circle me-2"
                    width="40"
                    height="40"
                  />
                  <div>
                    <h6 className="mb-0">{order.seller.full_name}</h6>
                    <small className="text-muted">{order.seller.email}</small>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2">
                {order.can_accept && (
                  <button
                    className="btn btn-success"
                    onClick={() => handleOrderAction('accept')}
                  >
                    <i className="bi bi-check-lg me-2"></i>
                    قبول الطلب
                  </button>
                )}

                {order.can_reject && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleOrderAction('reject')}
                  >
                    <i className="bi bi-x-lg me-2"></i>
                    رفض الطلب
                  </button>
                )}

                {order.can_complete && (
                  <button
                    className="btn btn-success"
                    onClick={() => handleOrderAction('complete')}
                  >
                    <i className="bi bi-check-all me-2"></i>
                    إكمال الطلب
                  </button>
                )}

                {order.can_cancel && (
                  <button
                    className="btn btn-warning"
                    onClick={() => handleOrderAction('cancel')}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    إلغاء الطلب
                  </button>
                )}

                <Link
                  to={`/chat?order=${order.id}`}
                  className="btn btn-outline-primary"
                >
                  <i className="bi bi-chat-dots me-2"></i>
                  فتح محادثة
                </Link>

                {order.status === 'completed' && !ratings.some(r => r.rater.id === user.id) && (
                  <button
                    className="btn btn-outline-warning"
                    onClick={() => setShowRatingModal(true)}
                  >
                    <i className="bi bi-star me-2"></i>
                    تقييم الطلب
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <i className="bi bi-info-circle me-2"></i>
            التفاصيل
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'tracking' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracking')}
          >
            <i className="bi bi-truck me-2"></i>
            التتبع ({tracking.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <i className="bi bi-chat-dots me-2"></i>
            الرسائل ({messages.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'ratings' ? 'active' : ''}`}
            onClick={() => setActiveTab('ratings')}
          >
            <i className="bi bi-star me-2"></i>
            التقييمات ({ratings.length})
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div>
              <h5 className="fw-bold mb-3">تفاصيل الطلب</h5>
              <div className="row">
                <div className="col-md-6">
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>رقم الطلب:</strong></td>
                        <td>{order.order_number}</td>
                      </tr>
                      <tr>
                        <td><strong>تاريخ الطلب:</strong></td>
                        <td>{formatDate(order.created_at)}</td>
                      </tr>
                      <tr>
                        <td><strong>الحالة:</strong></td>
                        <td>{getStatusBadge(order.status)}</td>
                      </tr>
                      <tr>
                        <td><strong>حالة الدفع:</strong></td>
                        <td><span className="badge bg-secondary">{order.payment_status}</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <table className="table table-borderless">
                    <tbody>
                      {order.accepted_at && (
                        <tr>
                          <td><strong>تاريخ القبول:</strong></td>
                          <td>{formatDate(order.accepted_at)}</td>
                        </tr>
                      )}
                      {order.completed_at && (
                        <tr>
                          <td><strong>تاريخ الإكمال:</strong></td>
                          <td>{formatDate(order.completed_at)}</td>
                        </tr>
                      )}
                      {order.expected_delivery_date && (
                        <tr>
                          <td><strong>التسليم المتوقع:</strong></td>
                          <td>{formatDate(order.expected_delivery_date)}</td>
                        </tr>
                      )}
                      <tr>
                        <td><strong>رقم التسليم:</strong></td>
                        <td>{order.delivery_phone}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tracking Tab */}
          {activeTab === 'tracking' && (
            <div>
              <h5 className="fw-bold mb-3">تتبع الطلب</h5>
              {tracking.length > 0 ? (
                <div className="timeline">
                  {tracking.map((track, index) => (
                    <div key={track.id} className="timeline-item">
                      <div className="timeline-marker bg-primary"></div>
                      <div className="timeline-content">
                        <h6 className="fw-bold">{track.status}</h6>
                        <p className="text-muted mb-1">{track.description}</p>
                        <small className="text-muted">
                          {formatDate(track.created_at)} - بواسطة {track.created_by.full_name}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-truck text-muted" style={{ fontSize: '3rem' }}></i>
                  <h6 className="mt-3 text-muted">لا توجد معلومات تتبع</h6>
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div>
              <h5 className="fw-bold mb-3">رسائل الطلب</h5>
              
              {/* Messages List */}
              <div className="mb-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {messages.length > 0 ? (
                  messages.map(message => (
                    <div key={message.id} className="d-flex mb-3">
                      <img
                        src={message.sender.avatar_url || '/default-avatar.png'}
                        alt={message.sender.full_name}
                        className="rounded-circle me-3"
                        width="40"
                        height="40"
                      />
                      <div className="flex-grow-1">
                        <div className="bg-light rounded p-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0 fw-bold">{message.sender.full_name}</h6>
                            <small className="text-muted">{formatDate(message.created_at)}</small>
                          </div>
                          <p className="mb-0">{message.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-chat-dots text-muted" style={{ fontSize: '3rem' }}></i>
                    <h6 className="mt-3 text-muted">لا توجد رسائل</h6>
                  </div>
                )}
              </div>

              {/* Send Message Form */}
              <form onSubmit={sendMessage}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="اكتب رسالة..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-send"></i>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Ratings Tab */}
          {activeTab === 'ratings' && (
            <div>
              <h5 className="fw-bold mb-3">التقييمات</h5>
              {ratings.length > 0 ? (
                <div className="row">
                  {ratings.map(rating => (
                    <div key={rating.id} className="col-md-6 mb-3">
                      <div className="card border-0 bg-light">
                        <div className="card-body">
                          <div className="d-flex align-items-center mb-2">
                            <img
                              src={rating.rater.avatar_url || '/default-avatar.png'}
                              alt={rating.rater.full_name}
                              className="rounded-circle me-2"
                              width="32"
                              height="32"
                            />
                            <div>
                              <h6 className="mb-0">{rating.rater.full_name}</h6>
                              <div>
                                {[...Array(5)].map((_, i) => (
                                  <i
                                    key={i}
                                    className={`bi bi-star${i < rating.rating ? '-fill' : ''} text-warning`}
                                  ></i>
                                ))}
                              </div>
                            </div>
                          </div>
                          {rating.comment && (
                            <p className="text-muted mb-0">{rating.comment}</p>
                          )}
                          <small className="text-muted">{formatDate(rating.created_at)}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-star text-muted" style={{ fontSize: '3rem' }}></i>
                  <h6 className="mt-3 text-muted">لا توجد تقييمات</h6>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      <div className={`modal fade ${showRatingModal ? 'show' : ''}`} style={{ display: showRatingModal ? 'block' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">تقييم الطلب</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowRatingModal(false)}
              ></button>
            </div>
            <form onSubmit={submitRating}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">التقييم</label>
                  <div className="d-flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className="btn btn-outline-warning"
                        onClick={() => setNewRating(prev => ({ ...prev, rating: star }))}
                      >
                        <i className={`bi bi-star${star <= newRating.rating ? '-fill' : ''}`}></i>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">تعليق (اختياري)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={newRating.comment}
                    onChange={(e) => setNewRating(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="اكتب تعليقك على الطلب..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRatingModal(false)}
                >
                  إلغاء
                </button>
                <button type="submit" className="btn btn-warning">
                  <i className="bi bi-star me-2"></i>
                  إرسال التقييم
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      {showRatingModal && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default OrderDetail;