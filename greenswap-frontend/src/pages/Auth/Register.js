import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    password_confirm: '',
    user_type: 'individual',
    phone: '',
    business_name: '',
    business_license: '',
    business_address: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
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
    
    if (formData.password !== formData.password_confirm) {
      showError('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData);
      
      if (result.success) {
        showSuccess('تم إنشاء الحساب بنجاح');
        navigate('/');
      } else {
        showError(result.error);
      }
    } catch (error) {
      showError('حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="bi bi-recycle text-primary" style={{ fontSize: '3rem' }}></i>
                <h2 className="fw-bold mt-3">إنشاء حساب جديد</h2>
                <p className="text-muted">انضم إلى مجتمع GreenSwap Egypt</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="full_name" className="form-label">الاسم الكامل</label>
                    <input
                      type="text"
                      className="form-control"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
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
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
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

                  <div className="col-md-6 mb-3">
                    <label htmlFor="password_confirm" className="form-label">تأكيد كلمة المرور</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password_confirm"
                      name="password_confirm"
                      value={formData.password_confirm}
                      onChange={handleChange}
                      required
                      placeholder="أعد إدخال كلمة المرور"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="user_type" className="form-label">نوع الحساب</label>
                    <select
                      className="form-select"
                      id="user_type"
                      name="user_type"
                      value={formData.user_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="individual">فرد</option>
                      <option value="business">مؤسسة</option>
                      <option value="recycling_center">مركز إعادة تدوير</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="phone" className="form-label">رقم الهاتف</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="أدخل رقم هاتفك"
                    />
                  </div>
                </div>

                {(formData.user_type === 'business' || formData.user_type === 'recycling_center') && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="business_name" className="form-label">اسم المؤسسة</label>
                      <input
                        type="text"
                        className="form-control"
                        id="business_name"
                        name="business_name"
                        value={formData.business_name}
                        onChange={handleChange}
                        placeholder="أدخل اسم المؤسسة"
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="business_license" className="form-label">رقم الترخيص</label>
                        <input
                          type="text"
                          className="form-control"
                          id="business_license"
                          name="business_license"
                          value={formData.business_license}
                          onChange={handleChange}
                          placeholder="رقم الترخيص التجاري"
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="business_address" className="form-label">عنوان المؤسسة</label>
                        <input
                          type="text"
                          className="form-control"
                          id="business_address"
                          name="business_address"
                          value={formData.business_address}
                          onChange={handleChange}
                          placeholder="عنوان المؤسسة"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="mb-4">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="terms" required />
                    <label className="form-check-label" htmlFor="terms">
                      أوافق على{' '}
                      <Link to="/terms" className="text-primary text-decoration-none">
                        الشروط والأحكام
                      </Link>
                      {' '}و{' '}
                      <Link to="/privacy" className="text-primary text-decoration-none">
                        سياسة الخصوصية
                      </Link>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    'إنشاء الحساب'
                  )}
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="text-muted">
                  لديك حساب بالفعل؟{' '}
                  <Link to="/login" className="text-primary text-decoration-none fw-bold">
                    تسجيل الدخول
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

export default Register;