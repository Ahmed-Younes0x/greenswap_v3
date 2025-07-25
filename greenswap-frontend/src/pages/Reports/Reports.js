import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import {api} from '../../services/api'; // Assuming you have a configured axios instance


const Reports = () => {
  const { user, isAdmin } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    priority: ''
  });
  const [newReport, setNewReport] = useState({
    report_type: 'inappropriate_item',
    title: '',
    description: '',
    evidence_image: null
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/reports/?${params}`);
      setReports(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      showError('فشل في تحميل البلاغات');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('report_type', newReport.report_type);
      formData.append('title', newReport.title);
      formData.append('description', newReport.description);
      
      if (newReport.evidence_image) {
        formData.append('evidence_image', newReport.evidence_image);
      }

      await api.post('/reports/', formData);
      
      showSuccess('تم إرسال البلاغ بنجاح');
      setShowCreateModal(false);
      setNewReport({
        report_type: 'inappropriate_item',
        title: '',
        description: '',
        evidence_image: null
      });
      fetchReports();
    } catch (error) {
      console.error('Error creating report:', error);
      showError('فشل في إرسال البلاغ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewReport = async (reportId, action, response = '') => {
    try {
      await api.post(`/reports/${reportId}/review/`, {
        action,
        response
      });
      
      showSuccess(`تم ${action === 'resolve' ? 'حل' : action === 'reject' ? 'رفض' : 'مراجعة'} البلاغ`);
      fetchReports();
    } catch (error) {
      console.error('Error reviewing report:', error);
      showError('فشل في مراجعة البلاغ');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-warning', text: 'قيد المراجعة', icon: 'clock' },
      under_review: { class: 'bg-info', text: 'تحت المراجعة', icon: 'eye' },
      resolved: { class: 'bg-success', text: 'تم الحل', icon: 'check-circle' },
      rejected: { class: 'bg-danger', text: 'مرفوض', icon: 'x-circle' },
      escalated: { class: 'bg-dark', text: 'تم التصعيد', icon: 'arrow-up' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`badge ${config.class}`}>
        <i className={`bi bi-${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { class: 'bg-secondary', text: 'منخفض' },
      medium: { class: 'bg-primary', text: 'متوسط' },
      high: { class: 'bg-warning', text: 'عالي' },
      urgent: { class: 'bg-danger', text: 'عاجل' }
    };

    const config = priorityConfig[priority] || priorityConfig.medium;
    
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

  const reportTypes = [
    { value: 'inappropriate_item', label: 'منتج غير مناسب' },
    { value: 'fake_item', label: 'منتج وهمي' },
    { value: 'abusive_user', label: 'مستخدم مسيء' },
    { value: 'spam', label: 'رسائل مزعجة' },
    { value: 'fraud', label: 'احتيال' },
    { value: 'inappropriate_content', label: 'محتوى غير مناسب' },
    { value: 'copyright', label: 'انتهاك حقوق الطبع' },
    { value: 'other', label: 'أخرى' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'قيد المراجعة' },
    { value: 'under_review', label: 'تحت المراجعة' },
    { value: 'resolved', label: 'تم الحل' },
    { value: 'rejected', label: 'مرفوض' },
    { value: 'escalated', label: 'تم التصعيد' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'منخفض' },
    { value: 'medium', label: 'متوسط' },
    { value: 'high', label: 'عالي' },
    { value: 'urgent', label: 'عاجل' }
  ];

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h2 className="fw-bold">البلاغات والشكاوى</h2>
          <p className="text-muted">
            {isAdmin ? 'إدارة جميع البلاغات والشكاوى' : 'عرض وإدارة بلاغاتك'}
          </p>
        </div>
        <div className="col-md-4 text-md-end">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="bi bi-plus-lg me-2"></i>
            بلاغ جديد
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">نوع البلاغ</label>
              <select
                className="form-select"
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="">جميع الأنواع</option>
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">الحالة</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">جميع الحالات</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">الأولوية</label>
              <select
                className="form-select"
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="">جميع الأولويات</option>
                {priorityOptions.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setFilters({ type: '', status: '', priority: '' })}
              >
                <i className="bi bi-x-circle me-2"></i>
                مسح الفلاتر
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <p className="mt-3 text-muted">جاري تحميل البلاغات...</p>
        </div>
      ) : reports.length > 0 ? (
        <div className="row">
          {reports.map(report => (
            <div key={report.id} className="col-lg-6 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0 fw-bold">{report.title}</h6>
                    <small className="text-muted">
                      بلاغ #{report.id} • {formatDate(report.created_at)}
                    </small>
                  </div>
                  <div className="text-end">
                    {getStatusBadge(report.status)}
                    <div className="mt-1">
                      {getPriorityBadge(report.priority)}
                    </div>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="mb-3">
                    <span className="badge bg-secondary me-2">
                      {reportTypes.find(t => t.value === report.report_type)?.label}
                    </span>
                  </div>
                  
                  <p className="text-muted mb-3">
                    {report.description.substring(0, 150)}
                    {report.description.length > 150 && '...'}
                  </p>
                  
                  <div className="d-flex align-items-center mb-3">
                    <img
                      src={report.reporter.avatar_url || '/default-avatar.png'}
                      alt={report.reporter.full_name}
                      className="rounded-circle me-2"
                      width="24"
                      height="24"
                    />
                    <span className="small text-muted">
                      بواسطة: {report.reporter.full_name}
                    </span>
                  </div>
                  
                  {report.evidence_image_url && (
                    <div className="mb-3">
                      <img
                        src={report.evidence_image_url}
                        alt="دليل البلاغ"
                        className="img-thumbnail"
                        style={{ maxWidth: '100px', maxHeight: '100px' }}
                      />
                    </div>
                  )}
                  
                  {report.admin_response && (
                    <div className="alert alert-info">
                      <strong>رد الإدارة:</strong>
                      <p className="mb-0 mt-2">{report.admin_response}</p>
                      {report.reviewed_by && (
                        <small className="text-muted">
                          بواسطة: {report.reviewed_by.full_name}
                        </small>
                      )}
                    </div>
                  )}
                </div>
                
                {isAdmin && report.can_review && (
                  <div className="card-footer bg-white">
                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleReviewReport(report.id, 'review')}
                      >
                        <i className="bi bi-eye me-1"></i>
                        مراجعة
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleReviewReport(report.id, 'resolve')}
                      >
                        <i className="bi bi-check-lg me-1"></i>
                        حل
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleReviewReport(report.id, 'reject')}
                      >
                        <i className="bi bi-x-lg me-1"></i>
                        رفض
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-flag text-muted" style={{ fontSize: '4rem' }}></i>
          <h4 className="mt-3 text-muted">لا توجد بلاغات</h4>
          <p className="text-muted">لم يتم إرسال أي بلاغات بعد</p>
        </div>
      )}

      {/* Create Report Modal */}
      <div className={`modal fade ${showCreateModal ? 'show' : ''}`} style={{ display: showCreateModal ? 'block' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">إرسال بلاغ جديد</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowCreateModal(false)}
              ></button>
            </div>
            <form onSubmit={handleCreateReport}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">نوع البلاغ</label>
                  <select
                    className="form-select"
                    value={newReport.report_type}
                    onChange={(e) => setNewReport(prev => ({ ...prev, report_type: e.target.value }))}
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
                  <label className="form-label">عنوان البلاغ</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newReport.title}
                    onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="عنوان مختصر للبلاغ"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">تفاصيل البلاغ</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={newReport.description}
                    onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                    required
                    placeholder="اشرح سبب البلاغ بالتفصيل"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label">صورة كدليل (اختياري)</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => setNewReport(prev => ({ ...prev, evidence_image: e.target.files[0] }))}
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
                  onClick={() => setShowCreateModal(false)}
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
                    'إرسال البلاغ'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      {showCreateModal && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default Reports;