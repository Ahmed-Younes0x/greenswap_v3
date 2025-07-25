import React, { useState, useEffect } from 'react';
import {api} from '../../services/api'; // Assuming you have a configured axios instance

import { useNotification } from '../../contexts/NotificationContext';

const Dashboard = () => {
  const { showSuccess, showError } = useNotification();
  
  const [overview, setOverview] = useState({});
  const [realtimeStats, setRealtimeStats] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchDashboardData();
    
    // Update realtime stats every 30 seconds
    const interval = setInterval(fetchRealtimeStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    } else if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab, period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewRes, realtimeRes] = await Promise.all([
        api.get('/dashboard/overview/'),
        api.get('/dashboard/realtime/')
      ]);

      setOverview(overviewRes.data);
      setRealtimeStats(realtimeRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('فشل في تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeStats = async () => {
    try {
      const response = await api.get('/dashboard/realtime/');
      setRealtimeStats(response.data);
    } catch (error) {
      console.error('Error fetching realtime stats:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/dashboard/analytics/?period=${period}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showError('فشل في تحميل التحليلات');
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await api.get('/dashboard/logs/');
      setLogs(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
      showError('فشل في تحميل السجلات');
    }
  };

  const exportData = async (type, format) => {
    try {
      const response = await api.post('/dashboard/export/', {
        type,
        format
      });
      
      showSuccess('تم تصدير البيانات بنجاح');
    } catch (error) {
      console.error('Error exporting data:', error);
      showError('فشل في تصدير البيانات');
    }
  };

  const clearCache = async () => {
    try {
      await api.post('/dashboard/cache/clear/');
      showSuccess('تم مسح التخزين المؤقت بنجاح');
    } catch (error) {
      console.error('Error clearing cache:', error);
      showError('فشل في مسح التخزين المؤقت');
    }
  };

  const getGrowthIcon = (value) => {
    if (value > 0) return <i className="bi bi-arrow-up text-success"></i>;
    if (value < 0) return <i className="bi bi-arrow-down text-danger"></i>;
    return <i className="bi bi-dash text-muted"></i>;
  };

  const getLogLevelBadge = (level) => {
    const levelConfig = {
      DEBUG: { class: 'bg-secondary', icon: 'bug' },
      INFO: { class: 'bg-info', icon: 'info-circle' },
      WARNING: { class: 'bg-warning', icon: 'exclamation-triangle' },
      ERROR: { class: 'bg-danger', icon: 'x-circle' },
      CRITICAL: { class: 'bg-dark', icon: 'exclamation-octagon' }
    };

    const config = levelConfig[level] || levelConfig.INFO;
    
    return (
      <span className={`badge ${config.class}`}>
        <i className={`bi bi-${config.icon} me-1`}></i>
        {level}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <p className="mt-3 text-muted">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 page-container">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h2 className="fw-bold">لوحة التحكم الإدارية</h2>
          <p className="text-muted">مراقبة وإدارة منصة GreenSwap Egypt</p>
        </div>
        <div className="col-md-4 text-md-end">
          <div className="dropdown">
            <button
              className="btn btn-outline-primary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              <i className="bi bi-download me-2"></i>
              تصدير البيانات
            </button>
            <ul className="dropdown-menu">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => exportData('users', 'excel')}
                >
                  <i className="bi bi-people me-2"></i>
                  المستخدمين (Excel)
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => exportData('items', 'excel')}
                >
                  <i className="bi bi-box me-2"></i>
                  المنتجات (Excel)
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => exportData('orders', 'excel')}
                >
                  <i className="bi bi-cart me-2"></i>
                  الطلبات (Excel)
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-speedometer2 me-2"></i>
            نظرة عامة
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <i className="bi bi-graph-up me-2"></i>
            التحليلات
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <i className="bi bi-journal-text me-2"></i>
            السجلات
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'tools' ? 'active' : ''}`}
            onClick={() => setActiveTab('tools')}
          >
            <i className="bi bi-tools me-2"></i>
            أدوات الإدارة
          </button>
        </li>
      </ul>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Realtime Stats */}
          <div className="row mb-4">
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card gradient-bg-1 text-white border-0 hover-lift-lg">
                <div className="card-body text-center">
                  <i className="bi bi-people" style={{ fontSize: '2.5rem' }}></i>
                  <h4 className="mt-2 mb-1">{realtimeStats.online_users || 0}</h4>
                  <p className="mb-0 small">مستخدمين متصلين</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card gradient-bg-4 text-white border-0 hover-lift-lg">
                <div className="card-body text-center">
                  <i className="bi bi-cart-check" style={{ fontSize: '2.5rem' }}></i>
                  <h4 className="mt-2 mb-1">{realtimeStats.current_orders || 0}</h4>
                  <p className="mb-0 small">طلبات نشطة</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card gradient-bg-5 text-white border-0 hover-lift-lg">
                <div className="card-body text-center">
                  <i className="bi bi-cpu" style={{ fontSize: '2.5rem' }}></i>
                  <h4 className="mt-2 mb-1">{realtimeStats.system_load?.toFixed(1) || 0}%</h4>
                  <p className="mb-0 small">حمولة النظام</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card gradient-bg-3 text-white border-0 hover-lift-lg">
                <div className="card-body text-center">
                  <i className="bi bi-memory" style={{ fontSize: '2.5rem' }}></i>
                  <h4 className="mt-2 mb-1">{realtimeStats.memory_usage?.toFixed(1) || 0}%</h4>
                  <p className="mb-0 small">استخدام الذاكرة</p>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Stats */}
          {overview.today && (
            <div className="row mb-4">
              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">إجمالي المستخدمين</h6>
                        <h3 className="fw-bold mb-0">{overview.today.total_users}</h3>
                        <small className="text-success">
                          {getGrowthIcon(overview.today.new_users_today)}
                          +{overview.today.new_users_today} اليوم
                        </small>
                      </div>
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                        <i className="bi bi-people text-primary fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">إجمالي المنتجات</h6>
                        <h3 className="fw-bold mb-0">{overview.today.total_items}</h3>
                        <small className="text-success">
                          {getGrowthIcon(overview.today.new_items_today)}
                          +{overview.today.new_items_today} اليوم
                        </small>
                      </div>
                      <div className="bg-success bg-opacity-10 rounded-circle p-3">
                        <i className="bi bi-box text-success fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">إجمالي الطلبات</h6>
                        <h3 className="fw-bold mb-0">{overview.today.total_orders}</h3>
                        <small className="text-success">
                          {getGrowthIcon(overview.today.new_orders_today)}
                          +{overview.today.new_orders_today} اليوم
                        </small>
                      </div>
                      <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                        <i className="bi bi-cart text-warning fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="text-muted mb-1">إجمالي الإيرادات</h6>
                        <h3 className="fw-bold mb-0">{overview.today.total_revenue} جنيه</h3>
                        <small className="text-success">
                          {getGrowthIcon(overview.today.revenue_today)}
                          +{overview.today.revenue_today} اليوم
                        </small>
                      </div>
                      <div className="bg-info bg-opacity-10 rounded-circle p-3">
                        <i className="bi bi-currency-exchange text-info fs-4"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="row">
            <div className="col-lg-8 mb-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0 fw-bold">الإحصائيات السريعة</h5>
                </div>
                <div className="card-body">
                  {overview.quick_stats && (
                    <div className="row text-center">
                      <div className="col-3">
                        <div className="border-end">
                          <h4 className="text-warning fw-bold">{overview.quick_stats.pending_orders}</h4>
                          <small className="text-muted">طلبات معلقة</small>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="border-end">
                          <h4 className="text-primary fw-bold">{overview.quick_stats.active_users_today}</h4>
                          <small className="text-muted">مستخدمين نشطين</small>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="border-end">
                          <h4 className="text-info fw-bold">{overview.quick_stats.ai_analyses_today}</h4>
                          <small className="text-muted">تحليلات ذكية</small>
                        </div>
                      </div>
                      <div className="col-3">
                        <h4 className="text-success fw-bold">{overview.quick_stats.new_conversations_today}</h4>
                        <small className="text-muted">محادثات جديدة</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 mb-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0 fw-bold">إجراءات سريعة</h5>
                </div>
                <div className="card-body">
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-outline-primary"
                      onClick={clearCache}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      مسح التخزين المؤقت
                    </button>
                    <button
                      className="btn btn-outline-info"
                      onClick={() => exportData('users', 'excel')}
                    >
                      <i className="bi bi-download me-2"></i>
                      تصدير المستخدمين
                    </button>
                    <button
                      className="btn btn-outline-success"
                      onClick={() => setActiveTab('analytics')}
                    >
                      <i className="bi bi-graph-up me-2"></i>
                      عرض التحليلات
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="row">
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">التحليلات المتقدمة</h5>
                <select
                  className="form-select"
                  style={{ width: 'auto' }}
                  value={period}
                  onChange={(e) => setPeriod(parseInt(e.target.value))}
                >
                  <option value={7}>آخر 7 أيام</option>
                  <option value={30}>آخر 30 يوم</option>
                  <option value={90}>آخر 3 أشهر</option>
                  <option value={365}>آخر سنة</option>
                </select>
              </div>
              <div className="card-body">
                <div className="text-center py-5">
                  <i className="bi bi-graph-up text-muted" style={{ fontSize: '4rem' }}></i>
                  <h5 className="mt-3 text-muted">التحليلات المتقدمة</h5>
                  <p className="text-muted">سيتم إضافة الرسوم البيانية والتحليلات المفصلة هنا</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 fw-bold">سجلات النظام</h5>
              </div>
              <div className="card-body p-0">
                {logs.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>المستوى</th>
                          <th>الرسالة</th>
                          <th>الوحدة</th>
                          <th>المستخدم</th>
                          <th>التوقيت</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.slice(0, 20).map(log => (
                          <tr key={log.id}>
                            <td>{getLogLevelBadge(log.level)}</td>
                            <td>
                              <span className="text-truncate d-inline-block" style={{ maxWidth: '300px' }}>
                                {log.message}
                              </span>
                            </td>
                            <td>
                              <code className="small">{log.module}</code>
                            </td>
                            <td>
                              {log.user ? (
                                <div className="d-flex align-items-center">
                                  <img
                                    src={log.user.avatar_url || '/default-avatar.png'}
                                    alt={log.user.full_name}
                                    className="rounded-circle me-2"
                                    width="24"
                                    height="24"
                                  />
                                  <span className="small">{log.user.full_name}</span>
                                </div>
                              ) : (
                                <span className="text-muted">النظام</span>
                              )}
                            </td>
                            <td>
                              <small className="text-muted">{log.time_ago}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-journal-text text-muted" style={{ fontSize: '3rem' }}></i>
                    <h6 className="mt-3 text-muted">لا توجد سجلات</h6>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 fw-bold">أدوات النظام</h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-3">
                  <button
                    className="btn btn-outline-warning"
                    onClick={clearCache}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    مسح التخزين المؤقت
                  </button>
                  
                  <button
                    className="btn btn-outline-info"
                    onClick={() => exportData('reports', 'pdf')}
                  >
                    <i className="bi bi-file-pdf me-2"></i>
                    تصدير تقرير PDF
                  </button>
                  
                  <button
                    className="btn btn-outline-success"
                    onClick={() => exportData('all', 'excel')}
                  >
                    <i className="bi bi-file-excel me-2"></i>
                    تصدير تقرير Excel شامل
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 fw-bold">صحة النظام</h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-6 mb-3">
                    <div className="border-end">
                      <h5 className="text-primary fw-bold">{realtimeStats.database_connections || 0}</h5>
                      <small className="text-muted">اتصالات قاعدة البيانات</small>
                    </div>
                  </div>
                  <div className="col-6 mb-3">
                    <h5 className="text-success fw-bold">{realtimeStats.cache_hit_rate || 0}%</h5>
                    <small className="text-muted">معدل نجاح التخزين المؤقت</small>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small>استخدام المعالج</small>
                    <small>{realtimeStats.system_load?.toFixed(1) || 0}%</small>
                  </div>
                  <div className="progress mb-3" style={{ height: '8px' }}>
                    <div
                      className="progress-bar bg-primary"
                      style={{ width: `${realtimeStats.system_load || 0}%` }}
                    ></div>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-1">
                    <small>استخدام الذاكرة</small>
                    <small>{realtimeStats.memory_usage?.toFixed(1) || 0}%</small>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div
                      className="progress-bar bg-warning"
                      style={{ width: `${realtimeStats.memory_usage || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;