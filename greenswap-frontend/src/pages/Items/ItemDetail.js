import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import {api} from '../../services/api';


const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [orderData, setOrderData] = useState({
    quantity: 1,
    delivery_address: '',
    delivery_phone: '',
    delivery_notes: '',
    buyer_notes: ''
  });
  const [reportData, setReportData] = useState({
    report_type: 'inappropriate_item',
    title: '',
    description: '',
    evidence_image: null
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await api.get(`/items/${id}/`);
      setItem(response.data);
      setLiked(response.data.is_liked);
    } catch (error) {
      console.error('Error fetching item:', error);
      showError('فشل في تحميل تفاصيل المنتج');
      navigate('/items');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      showError('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      const response = await api.post(`/items/${id}/toggle-like/`);
      setLiked(response.data.liked);
      setItem(prev => ({
        ...prev,
        likes_count: response.data.likes_count
      }));
      
      showSuccess(response.data.liked ? 'تم الإعجاب بالمنتج' : 'تم إلغاء الإعجاب');
    } catch (error) {
      console.error('Error toggling like:', error);
      showError(error.response?.data?.error || 'فشل في تحديث الإعجاب');
    }
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.post('/orders/create/', {
        item_id: item.id,
        ...orderData
      });

      showSuccess('تم إرسال الطلب بنجاح');
      setShowOrderModal(false);
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      showError(error.response?.data?.message || 'فشل في إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('report_type', reportData.report_type);
      formData.append('title', reportData.title);
      formData.append('description', reportData.description);
      formData.append('content_type', 'item');
      formData.append('object_id', item.id);
      
      if (reportData.evidence_image) {
        formData.append('evidence_image', reportData.evidence_image);
      }

      await api.post('/reports/', formData);

      showSuccess('تم إرسال البلاغ بنجاح');
      setShowReportModal(false);
      setReportData({
        report_type: 'inappropriate_item',
        title: '',
        description: '',
        evidence_image: null
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      showError('فشل في إرسال البلاغ');
    } finally {
      setSubmitting(false);
    }
  };

  const startChat = async () => {
    if (!isAuthenticated) {
      showError('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      const response = await api.post('/chat/conversations/', {
        conversation_type: 'direct',
        participant_id: item.owner.id,
        item_id: item.id,
        title: `محادثة حول: ${item.title}`
      });

      navigate(`/chat/${response.data.id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      showError('فشل في بدء المحادثة');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getConditionBadge = (condition) => {
    const conditionConfig = {
      new: { class: 'bg-success', text: 'جديد', icon: 'star-fill' },
      like_new: { class: 'bg-info', text: 'شبه جديد', icon: 'star' },
      good: { class: 'bg-primary', text: 'جيد', icon: 'check-circle' },
      fair: { class: 'bg-warning', text: 'مقبول', icon: 'dash-circle' },
      poor: { class: 'bg-secondary', text: 'سيء', icon: 'x-circle' }
    };
    const config = conditionConfig[condition] || conditionConfig.good;
    return (
      <span className={`badge ${config.class}`}>
        <i className={`bi bi-${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <p className="mt-3 text-muted">جاري تحميل تفاصيل المنتج...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
          <h3 className="mt-3">المنتج غير موجود</h3>
          <p className="text-muted">قد يكون المنتج محذوف أو غير متاح</p>
          <Link to="/items" className="btn btn-primary">
            <i className="bi bi-arrow-right me-2"></i>
            العودة للمنتجات
          </Link>
        </div>
      </div>
    );
  }

  const reportTypes = [
    { value: 'inappropriate_item', label: 'منتج غير مناسب' },
    { value: 'fake_item', label: 'منتج وهمي' },
    { value: 'spam', label: 'رسائل مزعجة' },
    { value: 'fraud', label: 'احتيال' },
    { value: 'copyright', label: 'انتهاك حقوق الطبع' },
    { value: 'other', label: 'أخرى' }
  ];

  return (
    <div className="container py-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">الرئيسية</Link></li>
          <li className="breadcrumb-item"><Link to="/items">المنتجات</Link></li>
          <li className="breadcrumb-item active">{item.title}</li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* Image Gallery */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="position-relative">
              <img
                src={item.images?.[currentImageIndex]?.image_url || item.image || 'http://localhost:8000/media/items/placeholder.png'}
                alt={item.title}
                className="card-img-top cursor-pointer"
                style={{ height: '450px', objectFit: 'cover' }}
                onClick={() => setShowImageModal(true)}
              />
              
              <div className="position-absolute top-0 start-0 m-3">
                {item.is_featured && (
                  <span className="badge bg-warning me-2">
                    <i className="bi bi-star-fill me-1"></i>
                    مميز
                  </span>
                )}
                {item.is_urgent && (
                  <span className="badge bg-danger">
                    <i className="bi bi-clock-fill me-1"></i>
                    عاجل
                  </span>
                )}
              </div>

              <div className="position-absolute top-0 end-0 m-3">
                {getConditionBadge(item.condition)}
              </div>

              {/* Image Navigation */}
              {item.images && item.images.length > 1 && (
                <>
                  <button
                    className="btn btn-dark btn-sm position-absolute top-50 start-0 translate-middle-y ms-2"
                    onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : item.images.length - 1)}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                  <button
                    className="btn btn-dark btn-sm position-absolute top-50 end-0 translate-middle-y me-2"
                    onClick={() => setCurrentImageIndex(prev => prev < item.images.length - 1 ? prev + 1 : 0)}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </>
              )}

              {/* Image Counter */}
              {item.images && item.images.length > 1 && (
                <div className="position-absolute bottom-0 end-0 m-3">
                  <span className="badge bg-dark bg-opacity-75">
                    {currentImageIndex + 1} / {item.images.length}
                  </span>
                </div>
              )}
            </div>
            
            {/* Image Thumbnails */}
            {item.images && item.images.length > 1 && (
              <div className="card-body">
                <div className="row g-2">
                  {item.images.map((image, index) => (
                    <div key={index} className="col-3">
                      <img
                        src={image.image_url}
                        alt={`${item.title} ${index + 1}`}
                        className={`img-thumbnail cursor-pointer w-100 ${index === currentImageIndex ? 'border-primary border-3' : ''}`}
                        style={{ height: '80px', objectFit: 'cover' }}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Item Details */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h1 className="h3 fw-bold mb-0">{item.title}</h1>
                <div className="dropdown">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => setShowReportModal(true)}
                      >
                        <i className="bi bi-flag me-2 text-danger"></i>
                        بلاغ عن المنتج
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item">
                        <i className="bi bi-share me-2 text-primary"></i>
                        مشاركة المنتج
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="d-flex align-items-center mb-4">
                <span className="h2 text-primary fw-bold me-3">
                  {parseFloat(item.price).toLocaleString('ar-EG')} جنيه
                </span>
                {item.is_negotiable && (
                  <span className="badge bg-info">
                    <i className="bi bi-chat-dots me-1"></i>
                    قابل للتفاوض
                  </span>
                )}
              </div>

              {/* Quick Info */}
              <div className="row mb-4">
                <div className="col-6">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-tag me-2 text-muted"></i>
                    <span className="fw-bold">الفئة:</span>
                    <span className="ms-2">{item.category.name}</span>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-box me-2 text-muted"></i>
                    <span className="fw-bold">الكمية:</span>
                    <span className="ms-2">{item.quantity}</span>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-calendar me-2 text-muted"></i>
                    <span className="fw-bold">تاريخ الإضافة:</span>
                    <span className="ms-2">{formatDate(item.created_at)}</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-geo-alt me-2 text-muted"></i>
                    <span className="fw-bold">الموقع:</span>
                    <span className="ms-2">{item.location}</span>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-eye me-2 text-muted"></i>
                    <span className="fw-bold">المشاهدات:</span>
                    <span className="ms-2">{item.views_count}</span>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-heart me-2 text-muted"></i>
                    <span className="fw-bold">الإعجابات:</span>
                    <span className="ms-2">{item.likes_count}</span>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              {(item.weight || item.dimensions || item.material) && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    تفاصيل إضافية
                  </h6>
                  <div className="row">
                    {item.weight && (
                      <div className="col-md-4 mb-2">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-speedometer2 me-2 text-muted"></i>
                          <span className="fw-bold">الوزن:</span>
                          <span className="ms-2">{item.weight} كيلو</span>
                        </div>
                      </div>
                    )}
                    {item.dimensions && (
                      <div className="col-md-4 mb-2">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-rulers me-2 text-muted"></i>
                          <span className="fw-bold">الأبعاد:</span>
                          <span className="ms-2">{item.dimensions}</span>
                        </div>
                      </div>
                    )}
                    {item.material && (
                      <div className="col-md-4 mb-2">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-layers me-2 text-muted"></i>
                          <span className="fw-bold">المادة:</span>
                          <span className="ms-2">{item.material}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-file-text me-2"></i>
                  الوصف
                </h6>
                <p className="text-muted" style={{ lineHeight: '1.6' }}>{item.description}</p>
              </div>

              {/* Owner Info */}
              <div className="card bg-light mb-4">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <img
                      src={item.owner.avatar_url || '/api/placeholder/60/60'}
                      alt={item.owner.full_name}
                      className="rounded-circle me-3"
                      width="60"
                      height="60"
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-1">
                        <h6 className="mb-0 fw-bold">{item.owner.full_name}</h6>
                        {item.owner.is_verified && (
                          <i className="bi bi-patch-check-fill text-primary ms-2" title="حساب موثق"></i>
                        )}
                      </div>
                      <div className="d-flex align-items-center text-muted small mb-2">
                        <i className="bi bi-star-fill text-warning me-1"></i>
                        {item.owner.rating_average.toFixed(1)} ({item.owner.rating_count} تقييم)
                        <span className="ms-3">
                          <i className="bi bi-box me-1"></i>
                          {item.owner.total_items_posted} منتج
                        </span>
                      </div>
                      <div className="text-muted small">
                        <i className="bi bi-calendar me-1"></i>
                        عضو منذ {formatDate(item.owner.date_joined)}
                      </div>
                    </div>
                    <Link 
                      to={`/users/${item.owner.id}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      عرض الملف
                    </Link>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2">
                {isAuthenticated && user?.id !== item.owner.id ? (
                  <>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => setShowOrderModal(true)}
                      disabled={item.status !== 'available'}
                    >
                      <i className="bi bi-cart-plus me-2"></i>
                      {item.status === 'available' ? 'طلب المنتج' : 'غير متاح'}
                    </button>
                    
                    <div className="row g-2">
                      <div className="col-4">
                        <button
                          className="btn btn-outline-primary w-100"
                          onClick={startChat}
                        >
                          <i className="bi bi-chat-dots me-2"></i>
                          محادثة
                        </button>
                      </div>
                      <div className="col-4">
                        <button
                          className={`btn w-100 ${liked ? 'btn-danger' : 'btn-outline-danger'}`}
                          onClick={handleLike}
                        >
                          <i className={`bi ${liked ? 'bi-heart-fill' : 'bi-heart'} me-2`}></i>
                          {liked ? 'مُعجب' : 'إعجاب'}
                        </button>
                      </div>
                      <div className="col-4">
                        <button className="btn btn-outline-secondary w-100">
                          <i className="bi bi-share me-2"></i>
                          مشاركة
                        </button>
                      </div>
                    </div>
                  </>
                ) : isAuthenticated && user?.id === item.owner.id ? (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    هذا منتجك الخاص
                    <div className="mt-2">
                      <Link to={`/items/${item.id}/edit`} className="btn btn-outline-primary btn-sm me-2">
                        <i className="bi bi-pencil me-1"></i>
                        تعديل
                      </Link>
                      <button className="btn btn-outline-danger btn-sm">
                        <i className="bi bi-trash me-1"></i>
                        حذف
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    يجب تسجيل الدخول لطلب المنتج
                    <div className="mt-2">
                      <Link to="/login" className="btn btn-primary btn-sm">
                        تسجيل الدخول
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      <div className={`modal fade ${showOrderModal ? 'show' : ''}`} style={{ display: showOrderModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-cart-plus me-2"></i>
                طلب المنتج
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowOrderModal(false)}
              ></button>
            </div>
            <form onSubmit={handleOrder}>
              <div className="modal-body">
                {/* Product Summary */}
                <div className="card bg-light mb-4">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <img
                        src={item.primary_image || '/api/placeholder/80/80'}
                        alt={item.title}
                        className="rounded me-3"
                        width="80"
                        height="80"
                        style={{ objectFit: 'cover' }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1">{item.title}</h6>
                        <p className="text-muted small mb-1">السعر: {item.price} جنيه</p>
                        <p className="text-muted small mb-0">الكمية المتاحة: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">الكمية المطلوبة</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      max={item.quantity}
                      value={orderData.quantity}
                      onChange={(e) => setOrderData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                      required
                    />
                    <div className="form-text">الكمية المتاحة: {item.quantity}</div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">رقم هاتف التسليم</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={orderData.delivery_phone}
                      onChange={(e) => setOrderData(prev => ({ ...prev, delivery_phone: e.target.value }))}
                      required
                      placeholder="رقم الهاتف للتواصل"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">عنوان التسليم</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={orderData.delivery_address}
                    onChange={(e) => setOrderData(prev => ({ ...prev, delivery_address: e.target.value }))}
                    required
                    placeholder="أدخل عنوان التسليم بالتفصيل"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">ملاحظات التسليم (اختياري)</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={orderData.delivery_notes}
                    onChange={(e) => setOrderData(prev => ({ ...prev, delivery_notes: e.target.value }))}
                    placeholder="أي ملاحظات خاصة بالتسليم"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">ملاحظات للبائع (اختياري)</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={orderData.buyer_notes}
                    onChange={(e) => setOrderData(prev => ({ ...prev, buyer_notes: e.target.value }))}
                    placeholder="أي ملاحظات أو أسئلة للبائع"
                  ></textarea>
                </div>

                <div className="alert alert-info">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>إجمالي المبلغ:</strong>
                    <span className="h5 mb-0 text-primary">
                      {(item.price * orderData.quantity).toLocaleString('ar-EG')} جنيه
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowOrderModal(false)}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      إرسال الطلب
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <div className={`modal fade ${showReportModal ? 'show' : ''}`} style={{ display: showReportModal ? 'block' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-flag me-2 text-danger"></i>
                بلاغ عن المنتج
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowReportModal(false)}
              ></button>
            </div>
            <form onSubmit={handleReport}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">نوع البلاغ</label>
                  <select
                    className="form-select"
                    value={reportData.report_type}
                    onChange={(e) => setReportData(prev => ({ ...prev, report_type: e.target.value }))}
                    required
                  >
                    {reportTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">عنوان البلاغ</label>
                  <input
                    type="text"
                    className="form-control"
                    value={reportData.title}
                    onChange={(e) => setReportData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="عنوان مختصر للبلاغ"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">تفاصيل البلاغ</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={reportData.description}
                    onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    placeholder="اشرح سبب البلاغ بالتفصيل"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">صورة كدليل (اختياري)</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => setReportData(prev => ({ ...prev, evidence_image: e.target.files[0] }))}
                  />
                  <div className="form-text">
                    يمكنك رفع صورة كدليل على البلاغ (حد أقصى 5 ميجابايت)
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReportModal(false)}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-flag me-2"></i>
                      إرسال البلاغ
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <div className={`modal fade ${showImageModal ? 'show' : ''}`} style={{ display: showImageModal ? 'block' : 'none' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{item.title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowImageModal(false)}
              ></button>
            </div>
            <div className="modal-body text-center">
              <img
                src={item.images?.[currentImageIndex]?.image_url || item.primary_image || '/api/placeholder/800/600'}
                alt={item.title}
                className="img-fluid"
                style={{ maxHeight: '70vh' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      {(showOrderModal || showReportModal || showImageModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default ItemDetail;
