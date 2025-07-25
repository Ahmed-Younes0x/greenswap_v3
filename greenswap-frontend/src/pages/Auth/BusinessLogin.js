import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const BusinessLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password, 'business');
      
      if (result.success) {
        showSuccess('مرحباً بك في منصة الشركات');
        navigate('/dashboard/business');
      } else {
        showError(result.error || 'بيانات تسجيل الدخول غير صحيحة');
      }
    } catch (error) {
      showError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg border-0 overflow-hidden">
              <div className="row g-0">
                {/* Left Side - Form */}
                <div className="col-lg-6">
                  <div className="p-5">
                    <div className="text-center mb-4">
                      <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                           style={{ width: '80px', height: '80px' }}>
                        <i className="bi bi-building text-success" style={{ fontSize: '2.5rem' }}></i>
                      </div>
                      <h2 className="fw-bold text-dark">تسجيل دخول الشركات</h2>
                      <p className="text-muted">ادخل إلى حساب شركتك في GreenSwap</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label fw-semibold">
                          <i className="bi bi-envelope me-2 text-success"></i>
                          البريد الإلكتروني للشركة
                        </label>
                        <input
                          type="email"
                          className="form-control form-control-lg"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="company@example.com"
                          autoComplete="email"
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="password" className="form-label fw-semibold">
                          <i className="bi bi-lock me-2 text-success"></i>
                          كلمة المرور
                        </label>
                        <div className="input-group">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-control form-control-lg"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="أدخل كلمة المرور"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="remember"
                            id="remember"
                            checked={formData.remember}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor="remember">
                            تذكر بيانات الشركة
                          </label>
                        </div>
                        <Link to="/forgot-password/business" className="text-success text-decoration-none">
                          نسيت كلمة المرور؟
                        </Link>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-success btn-lg w-100 mb-3"
                        disabled={loading}
                      >
                        {loading ? (
                          <LoadingSpinner size="sm" text="جاري تسجيل الدخول..." />
                        ) : (
                          <>
                            <i className="bi bi-box-arrow-in-right me-2"></i>
                            دخول منصة الشركات
                          </>
                        )}
                      </button>

                      <div className="text-center">
                        <p className="text-muted mb-3">
                          ليس لديك حساب شركة؟{' '}
                          <Link to="/register/business" className="text-success text-decoration-none fw-semibold">
                            تسجيل شركة جديدة
                          </Link>
                        </p>
                        
                        <div className="border-top pt-3">
                          <p className="text-muted small mb-2">أنواع حسابات أخرى:</p>
                          <div className="d-flex gap-2 justify-content-center">
                            <Link to="/login/individual" className="btn btn-outline-primary btn-sm">
                              <i className="bi bi-person me-1"></i>
                              الأفراد
                            </Link>
                            <Link to="/login/recycling" className="btn btn-outline-info btn-sm">
                              <i className="bi bi-recycle me-1"></i>
                              مراكز التدوير
                            </Link>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right Side - Info */}
                <div className="col-lg-6 bg-success text-white d-flex align-items-center">
                  <div className="p-5">
                    <div className="text-center mb-4">
                      <i className="bi bi-building" style={{ fontSize: '4rem', opacity: 0.9 }}></i>
                      <h3 className="fw-bold mt-3">منصة الشركات</h3>
                      <p className="lead opacity-90">
                        حلول متكاملة لإدارة المخلفات الصناعية
                      </p>
                    </div>

                    <div className="row text-center">
                      <div className="col-4">
                        <div className="bg-white bg-opacity-10 rounded-3 p-3 mb-2">
                          <i className="bi bi-graph-up" style={{ fontSize: '2rem' }}></i>
                        </div>
                        <h6 className="fw-semibold">تحليلات</h6>
                        <small className="opacity-75">تقارير مفصلة عن المخلفات</small>
                      </div>
                      <div className="col-4">
                        <div className="bg-white bg-opacity-10 rounded-3 p-3 mb-2">
                          <i className="bi bi-truck" style={{ fontSize: '2rem' }}></i>
                        </div>
                        <h6 className="fw-semibold">لوجستيات</h6>
                        <small className="opacity-75">إدارة النقل والتوصيل</small>
                      </div>
                      <div className="col-4">
                        <div className="bg-white bg-opacity-10 rounded-3 p-3 mb-2">
                          <i className="bi bi-award" style={{ fontSize: '2rem' }}></i>
                        </div>
                        <h6 className="fw-semibold">شهادات</h6>
                        <small className="opacity-75">شهادات الاستدامة البيئية</small>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-white bg-opacity-10 rounded-3">
                      <h6 className="fw-semibold mb-2">
                        <i className="bi bi-star-fill text-warning me-2"></i>
                        مميزات حساب الشركات
                      </h6>
                      <ul className="list-unstyled mb-0 small">
                        <li className="mb-1">
                          <i className="bi bi-check-circle me-2"></i>
                          إدارة المخلفات الصناعية بكميات كبيرة
                        </li>
                        <li className="mb-1">
                          <i className="bi bi-check-circle me-2"></i>
                          تقارير تحليلية مفصلة
                        </li>
                        <li className="mb-1">
                          <i className="bi bi-check-circle me-2"></i>
                          خدمات النقل والتوصيل
                        </li>
                        <li className="mb-0">
                          <i className="bi bi-check-circle me-2"></i>
                          شهادات الاستدامة البيئية
                        </li>
                      </ul>
                    </div>

                    <div className="mt-3 p-3 bg-warning bg-opacity-20 rounded-3">
                      <h6 className="fw-semibold mb-2">
                        <i className="bi bi-info-circle me-2"></i>
                        متطلبات التسجيل
                      </h6>
                      <ul className="list-unstyled mb-0 small">
                        <li className="mb-1">• السجل التجاري</li>
                        <li className="mb-1">• البطاقة الضريبية</li>
                        <li className="mb-0">• ترخيص النشاط</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessLogin;