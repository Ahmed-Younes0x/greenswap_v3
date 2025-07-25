import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        showSuccess('تم تسجيل الدخول بنجاح');
        navigate('/');
      } else {
        showError(result.error);
      }
    } catch (error) {
      showError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="bi bi-recycle text-primary" style={{ fontSize: '3rem' }}></i>
                <h2 className="fw-bold mt-3">تسجيل الدخول</h2>
                <p className="text-muted">مرحباً بك في GreenSwap Egypt</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">البريد الإلكتروني</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="أدخل بريدك الإلكتروني"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">كلمة المرور</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="أدخل كلمة المرور"
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="remember" />
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
                  className="btn btn-primary w-100 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    'تسجيل الدخول'
                  )}
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="text-muted">
                  ليس لديك حساب؟{' '}
                  <Link to="/register" className="text-primary text-decoration-none fw-bold">
                    إنشاء حساب جديد
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;