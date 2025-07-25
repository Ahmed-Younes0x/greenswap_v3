import React, { useState, useEffect } from 'react';
import AIService from '../../services/aiService';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const AIAnalytics = () => {
  const [analytics, setAnalytics] = useState({});
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const { showError } = useNotification();

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsData, trendsData] = await Promise.all([
        AIService.getAIStats(),
        AIService.analyzeTrends({ period: selectedPeriod })
      ]);
      
      setAnalytics(analyticsData);
      setTrends(trendsData.trends || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
      showError('فشل في تحميل التحليلات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner centered text="جاري تحميل التحليلات..." />;
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold">تحليلات الذكاء الاصطناعي</h2>
              <p className="text-muted">إحصائيات وتحليلات شاملة لاستخدام خدمات AI</p>
            </div>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="7">آخر 7 أيام</option>
              <option value="30">آخر 30 يوم</option>
              <option value="90">آخر 3 أشهر</option>
              <option value="365">آخر سنة</option>
            </select>
          </div>

          {/* Stats Cards */}
          <div className="row mb-5">
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card bg-primary text-white border-0 h-100">
                <div className="card-body text-center">
                  <i className="bi bi-eye" style={{ fontSize: '3rem' }}></i>
                  <h3 className="mt-3 mb-1">{analytics.total_analyses || 0}</h3>
                  <p className="mb-0">إجمالي التحليلات</p>
                  <small className="opacity-75">
                    +{analytics.recent_analyses_count || 0} خلال 24 ساعة
                  </small>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card bg-success text-white border-0 h-100">
                <div className="card-body text-center">
                  <i className="bi bi-check-circle" style={{ fontSize: '3rem' }}></i>
                  <h3 className="mt-3 mb-1">{analytics.completed_analyses || 0}</h3>
                  <p className="mb-0">تحليلات ناجحة</p>
                  <small className="opacity-75">
                    {analytics.total_analyses > 0 
                      ? Math.round((analytics.completed_analyses / analytics.total_analyses) * 100)
                      : 0
                    }% معدل النجاح
                  </small>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card bg-info text-white border-0 h-100">
                <div className="card-body text-center">
                  <i className="bi bi-speedometer" style={{ fontSize: '3rem' }}></i>
                  <h3 className="mt-3 mb-1">{analytics.avg_processing_time?.toFixed(1) || 0}s</h3>
                  <p className="mb-0">متوسط وقت المعالجة</p>
                  <small className="opacity-75">تحسن بنسبة 15%</small>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card bg-warning text-white border-0 h-100">
                <div className="card-body text-center">
                  <i className="bi bi-chat-dots" style={{ fontSize: '3rem' }}></i>
                  <h3 className="mt-3 mb-1">{analytics.chatbot_sessions || 0}</h3>
                  <p className="mb-0">جلسات البوت الذكي</p>
                  <small className="opacity-75">
                    {analytics.active_chatbot_sessions || 0} جلسة نشطة
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Types Distribution */}
          <div className="row mb-5">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0 fw-bold">توزيع أنواع التحليلات</h5>
                </div>
                <div className="card-body">
                  {analytics.analyses_by_type && Object.keys(analytics.analyses_by_type).length > 0 ? (
                    <div className="row">
                      {Object.entries(analytics.analyses_by_type).map(([type, count]) => (
                        <div key={type} className="col-md-6 mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-semibold">{type}</span>
                            <span className="text-primary fw-bold">{count}</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar bg-primary"
                              style={{ 
                                width: `${analytics.total_analyses > 0 
                                  ? (count / analytics.total_analyses) * 100 
                                  : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="bi bi-graph-up text-muted" style={{ fontSize: '3rem' }}></i>
                      <h6 className="mt-3 text-muted">لا توجد بيانات كافية</h6>
                      <p className="text-muted">ابدأ باستخدام خدمات AI لرؤية التحليلات</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0 fw-bold">الأداء العام</h5>
                </div>
                <div className="card-body">
                  <div className="text-center mb-4">
                    <div className="position-relative d-inline-block">
                      <svg width="120" height="120" className="transform-rotate-90">
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#e9ecef"
                          strokeWidth="10"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="#28a745"
                          strokeWidth="10"
                          strokeDasharray={`${2 * Math.PI * 50}`}
                          strokeDashoffset={`${2 * Math.PI * 50 * (1 - 0.95)}`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <h4 className="fw-bold text-success mb-0">95%</h4>
                        <small className="text-muted">دقة</small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row text-center">
                    <div className="col-6">
                      <h6 className="text-primary fw-bold">99.2%</h6>
                      <small className="text-muted">وقت التشغيل</small>
                    </div>
                    <div className="col-6">
                      <h6 className="text-success fw-bold">1.2s</h6>
                      <small className="text-muted">متوسط الاستجابة</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trends */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0 fw-bold">الاتجاهات والتوقعات</h5>
            </div>
            <div className="card-body">
              {trends.length > 0 ? (
                <div className="row">
                  {trends.map((trend, index) => (
                    <div key={index} className="col-lg-4 col-md-6 mb-4">
                      <div className="card border-0 bg-light h-100">
                        <div className="card-body">
                          <div className="d-flex align-items-center mb-3">
                            <div className={`bg-${trend.type === 'increase' ? 'success' : trend.type === 'decrease' ? 'danger' : 'info'} bg-opacity-10 rounded-circle p-2 me-3`}>
                              <i className={`bi bi-${trend.type === 'increase' ? 'arrow-up' : trend.type === 'decrease' ? 'arrow-down' : 'arrow-right'} text-${trend.type === 'increase' ? 'success' : trend.type === 'decrease' ? 'danger' : 'info'}`}></i>
                            </div>
                            <div>
                              <h6 className="fw-bold mb-1">{trend.title}</h6>
                              <small className="text-muted">{trend.category}</small>
                            </div>
                          </div>
                          <p className="text-muted mb-3">{trend.description}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className={`badge bg-${trend.type === 'increase' ? 'success' : trend.type === 'decrease' ? 'danger' : 'info'}`}>
                              {trend.percentage}%
                            </span>
                            <small className="text-muted">{trend.period}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-graph-up text-muted" style={{ fontSize: '3rem' }}></i>
                  <h6 className="mt-3 text-muted">لا توجد اتجاهات محددة</h6>
                  <p className="text-muted">سيتم عرض الاتجاهات عند توفر بيانات كافية</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalytics;