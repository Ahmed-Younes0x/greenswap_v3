import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const IndividualLogin = () => {
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
      const result = await login(formData.email, formData.password, 'individual');
      
      if (result.success) {
        showSuccess('مرحباً بك في GreenSwap Egypt');
        navigate('/');
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
                      <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                           style={{ width: '80px', height: '80px' }}>
                        <i className="bi bi-person-circle text-primary" style={{ fontSize: '2.5rem' }}></i>
                      </div>
                      <h2 className="fw-bold text-dark">تسجيل دخول الأفراد</h2>
                      <p className="text-muted">ادخل إلى حسابك الشخصي في GreenSwap</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label fw-semibold">
                          <i className="bi bi-envelope me-2 text-primary"></i>
                          البريد الإلكتروني
                        </label>
                        <input
                          type="email"
                          className="form-control form-control-lg"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="أدخل بريدك الإلكتروني"
                          autoComplete="email"
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="password" className="form-label fw-semibold">
                          <i className="bi bi-lock me-2 text-primary"></i>
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
                            تذكرني
                          </label>
                        </div>
                        <Link to="/forgot-password" className="text-primary text-decoration-none">
                          نسيت كلمة المرور؟
                        </Link>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100 mb-3"
                        disabled={loading}
                      >
                        {loading ? (
                          <LoadingSpinner size="sm" text="جاري تسجيل الدخول..." />
                        ) : (
                          <>
                            <i className="bi bi-box-arrow-in-right me-2"></i>
                            تسجيل الدخول
                          </>
                        )}
                      </button>

                      <div className="text-center">
                        <p className="text-muted mb-3">
                          ليس لديك حساب؟{' '}
                          <Link to="/register/individual" className="text-primary text-decoration-none fw-semibold">
                            إنشاء حساب جديد
                          </Link>
                        </p>
                        
                        <div className="border-top pt-3">
                          <p className="text-muted small mb-2">أنواع حسابات أخرى:</p>
                          <div className="d-flex gap-2 justify-content-center">
                            <Link to="/login/business" className="btn btn-outline-success btn-sm">
                              <i className="bi bi-building me-1"></i>
                              الشركات
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
                <div className="col-lg-6 bg-primary text-white d-flex align-items-center">
                  <div className="p-5">
                    <div className="text-center mb-4">
                      <i className="bi bi-recycle" style={{ fontSize: '4rem', opacity: 0.9 }}></i>
                      <h3 className="fw-bold mt-3">مرحباً بك في GreenSwap</h3>
                      <p className="lead opacity-90">
                        منصة إعادة التدوير الرائدة في مصر
                      </p>
                    </div>

                    <div className="row text-center">
                      <div className="col-4">
                        <div className="bg-white bg-opacity-10 rounded-3 p-3 mb-2">
                          <i className="bi bi-people" style={{ fontSize: '2rem' }}></i>
                        </div>
                        <h6 className="fw-semibold">للأفراد</h6>
                        <small className="opacity-75">بيع وشراء المخلفات بسهولة</small>
                      </div>
                      <div className="col-4">
                        <div className="bg-white bg-opacity-10 rounded-3 p-3 mb-2">
                          <i className="bi bi-shield-check" style={{ fontSize: '2rem' }}></i>
                        </div>
                        <h6 className="fw-semibold">آمان</h6>
                        <small className="opacity-75">معاملات آمنة ومضمونة</small>
                      </div>
                      <div className="col-4">
                        <div className="bg-white bg-opacity-10 rounded-3 p-3 mb-2">
                          <i className="bi bi-robot" style={{ fontSize: '2rem' }}></i>
                        </div>
                        <h6 className="fw-semibold">ذكي</h6>
                        <small className="opacity-75">تصنيف تلقائي بالذكاء الاصطناعي</small>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-white bg-opacity-10 rounded-3">
                      <h6 className="fw-semibold mb-2">
                        <i className="bi bi-star-fill text-warning me-2"></i>
                        مميزات الحساب الشخصي
                      </h6>
                      <ul className="list-unstyled mb-0 small">
                        <li className="mb-1">
                          <i className="bi bi-check-circle me-2"></i>
                          بيع المخلفات المنزلية
                        </li>
                        <li className="mb-1">
                          <i className="bi bi-check-circle me-2"></i>
                          شراء مواد معاد تدويرها
                        </li>
                        <li className="mb-1">
                          <i className="bi bi-check-circle me-2"></i>
                          تصنيف ذكي للمخلفات
                        </li>
                        <li className="mb-0">
                          <i className="bi bi-check-circle me-2"></i>
                          محادثات مباشرة مع البائعين
                        </li>
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

export default IndividualLogin;