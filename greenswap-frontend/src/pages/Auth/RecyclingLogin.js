import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const RecyclingLogin = () => {
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
      const result = await login(formData.email, formData.password, 'recycling_center');
      
      if (result.success) {
        showSuccess('مرحباً بك في منصة مراكز التدوير');
        navigate('/dashboard/recycling');
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
                      <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                           style={{ width: '80px', height: '80px' }}>
                        <i className="bi bi-recycle text-info" style={{ fontSize: '2.5rem' }}></i>
                      </div>
                      <h2 className="fw-bold text-dark">مراكز إعادة التدوير</h2>
                      <p className="text-muted">ادخل إلى منصة مركز التدوير الخاص بك</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label fw-semibold">
                          <i className="bi bi-envelope me-2 text-info"></i>
                          البريد الإلكتروني للمركز
                        </label>
                        <input
                          type="email"
                          className="form-control form-control-lg"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="center@recycling.com"
                          autoComplete="email"
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="password" className="form-label fw-semibold">
                          <i className="bi bi-lock me-2 text-info"></i>
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
                            تذكر بيانات المركز
                          </label>
                        </div>
                        <Link to="/forgot-password/recycling" className="text-info text-decoration-none">
                          نسيت كلمة المرور؟
                        </Link>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-info btn-lg w-100 mb-3"
                        disabled={loading}
                      >
                        {loading ? (
                          <LoadingSpinner size="sm" text="جاري تسجيل الدخول..." />
                        ) : (
                          <>
                            <i className="bi bi-box-arrow-in-right me-2"></i>
                            دخول منصة التدوير
                          </>
                        )}
                      </button>

                      <div className="text-center">
                        <p className="text-muted mb-3">
                          ليس لديك حساب مركز؟{' '}
                          <Link to="/register/recycling" className="text-info text-decoration-none fw-semibold">
                            تسجيل مركز جديد
                          </Link>
                        </p>
                        
                        <div className="border-top pt-3">
                          <p className="text-muted small mb-2">أنواع حسابات أخرى:</p>
                          <div className="d-flex gap-2 justify-content-center">
                            <Link to="/login/individual" className="btn btn-outline-primary btn-sm">
                              <i className="bi bi-person me-1"></i>
                              الأفراد
                            </Link>
                            <Link to="/login/business" className="btn btn-outline-success btn-sm">
                              <i className="bi bi-building me-1"></i>
                              الشركات
                            </Link>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right Side - Info */}
                <div className="col-lg-6 bg-info text-white d-flex align-items-center">
                  <div className="p-5">
                    <div className="text-center mb-4">
                      <i className="bi bi-recycle" style={{ fontSize: '4rem', opacity: 0.9 }}></i>
                      <h3 className="fw-bold mt-3">منصة مراكز التدوير</h3>
                      <p className="lead opacity-90">
                        إدارة متقدمة لعمليات إعادة التدوير
                      </p>
                    </div>

                    <div className="row text-center">
                      <div className="col-4">
                        <div className="bg-white bg-opacity-10 rounded-3 p-3 mb-2">
                          <i className="bi bi-gear-wide-connected" style={{ fontSize: '2rem' }}></i>
                        </div>
                        <h6 className="fw-semibold">معالجة</h6>
                        <small className="opacity-75">إدارة عمليات المعالجة</small>
                      </div>
                      <div className="col-4">
                        <div className="bg-white bg-opacity-10 rounded-3 p-3 mb-2">
                          <i className="bi bi-clipboard-data" style={{ fontSize: '2rem' }}></i>
                        </div>
                        <h6 className="fw-semibold">تتبع</h6>
                        <small className="opacity-75">تتبع المواد والكميات</small>
                      </div>
                      <div className="col-4">
                        <div className="bg-white bg-opacity-10 rounded-3 p-3 mb-2">
                          <i className="bi bi-patch-check" style={{ fontSize: '2rem' }}></i>
                        </div>
                        <h6 className="fw-semibold">جودة</h6>
                        <small className="opacity-75">ضمان الجودة والمعايير</small>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-white bg-opacity-10 rounded-3">
                      <h6 className="fw-semibold mb-2">
                        <i className="bi bi-star-fill text-warning me-2"></i>
                        مميزات منصة مراكز التدوير
                      </h6>
                      <ul className="list-unstyled mb-0 small">
                        <li className="mb-1">
                          <i className="bi bi-check-circle me-2"></i>
                          إدارة عمليات المعالجة والتدوير
                        </li>
                        <li className="mb-1">
                          <i className="bi bi-check-circle me-2"></i>
                          تتبع الكميات والمواد الواردة
                        </li>
                        <li className="mb-1">
                          <i className="bi bi-check-circle me-2"></i>
                          تقارير الإنتاج والكفاءة
                        </li>
                        <li className="mb-0">
                          <i className="bi bi-check-circle me-2"></i>
                          إدارة العمالة والمعدات
                        </li>
                      </ul>
                    </div>

                    <div className="mt-3 p-3 bg-warning bg-opacity-20 rounded-3">
                      <h6 className="fw-semibold mb-2">
                        <i className="bi bi-info-circle me-2"></i>
                        متطلبات التسجيل
                      </h6>
                      <ul className="list-unstyled mb-0 small">
                        <li className="mb-1">• ترخيص مزاولة النشاط</li>
                        <li className="mb-1">• شهادة الجودة البيئية</li>
                        <li className="mb-0">• تصريح وزارة البيئة</li>
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

export default RecyclingLogin;