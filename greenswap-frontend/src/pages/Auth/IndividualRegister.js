import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const IndividualRegister = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirm: '',
    location: '',
    bio: '',
    terms: false
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { register } = useAuth();
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
    
    if (formData.password !== formData.password_confirm) {
      showError('كلمتا المرور غير متطابقتين');
      return;
    }

    if (!formData.terms) {
      showError('يجب الموافقة على الشروط والأحكام');
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        ...formData,
        user_type: 'individual'
      });
      
      if (result.success) {
        showSuccess('تم إنشاء حسابك بنجاح! مرحباً بك في GreenSwap');
        navigate('/auth/verfy');
      } else {
        showError(result.error || 'فشل في إنشاء الحساب');
      }
    } catch (error) {
      showError('حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg border-0 overflow-hidden">
              <div className="row g-0">
                {/* Left Side - Form */}
                <div className="col-lg-7">
                  <div className="p-5">
                    <div className="text-center mb-4">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                           style={{ width: '80px', height: '80px' }}>
                        <i className="bi bi-person-plus text-primary" style={{ fontSize: '2.5rem' }}></i>
                      </div>
                      <h2 className="fw-bold text-dark">إنشاء حساب شخصي</h2>
                      <p className="text-muted">انضم إلى مجتمع GreenSwap Egypt</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="row text-center mb-4">
                      <div className="col-6">
                        <div className={`d-flex align-items-center justify-content-center ${currentStep >= 1 ? 'text-primary' : 'text-muted'}`}>
                          <div className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-light'}`} 
                               style={{ width: '30px', height: '30px' }}>
                            <small className="fw-bold">1</small>
                          </div>
                          <span className="fw-semibold small">البيانات الأساسية</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className={`d-flex align-items-center justify-content-center ${currentStep >= 2 ? 'text-primary' : 'text-muted'}`}>
                          <div className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-light'}`} 
                               style={{ width: '30px', height: '30px' }}>
                            <small className="fw-bold">2</small>
                          </div>
                          <span className="fw-semibold small">معلومات إضافية</span>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                      {/* Step 1: Basic Info */}
                      {currentStep === 1 && (
                        <div className="fade-in-up">
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="full_name" className="form-label fw-semibold">
                                <i className="bi bi-person me-2 text-primary"></i>
                                الاسم الكامل *
                              </label>
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
                              <label htmlFor="email" className="form-label fw-semibold">
                                <i className="bi bi-envelope me-2 text-primary"></i>
                                البريد الإلكتروني *
                              </label>
                              <input
                                type="email"
                                className="form-control"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="example@email.com"
                              />
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="phone" className="form-label fw-semibold">
                                <i className="bi bi-phone me-2 text-primary"></i>
                                رقم الهاتف *
                              </label>
                              <input
                                type="tel"
                                className="form-control"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="01xxxxxxxxx"
                              />
                            </div>

                            <div className="col-md-6 mb-3">
                              <label htmlFor="location" className="form-label fw-semibold">
                                <i className="bi bi-geo-alt me-2 text-primary"></i>
                                المحافظة *
                              </label>
                              <select
                                className="form-select"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                              >
                                <option value="">اختر المحافظة</option>
                                <option value="القاهرة">القاهرة</option>
                                <option value="الجيزة">الجيزة</option>
                                <option value="الإسكندرية">الإسكندرية</option>
                                <option value="الدقهلية">الدقهلية</option>
                                <option value="الشرقية">الشرقية</option>
                                <option value="القليوبية">القليوبية</option>
                                <option value="كفر الشيخ">كفر الشيخ</option>
                                <option value="الغربية">الغربية</option>
                                <option value="المنوفية">المنوفية</option>
                                <option value="البحيرة">البحيرة</option>
                                <option value="الإسماعيلية">الإسماعيلية</option>
                                <option value="بورسعيد">بورسعيد</option>
                                <option value="السويس">السويس</option>
                                <option value="المنيا">المنيا</option>
                                <option value="بني سويف">بني سويف</option>
                                <option value="الفيوم">الفيوم</option>
                                <option value="أسيوط">أسيوط</option>
                                <option value="سوهاج">سوهاج</option>
                                <option value="قنا">قنا</option>
                                <option value="الأقصر">الأقصر</option>
                                <option value="أسوان">أسوان</option>
                                <option value="البحر الأحمر">البحر الأحمر</option>
                                <option value="الوادي الجديد">الوادي الجديد</option>
                                <option value="مطروح">مطروح</option>
                                <option value="شمال سيناء">شمال سيناء</option>
                                <option value="جنوب سيناء">جنوب سيناء</option>
                              </select>
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="password" className="form-label fw-semibold">
                                <i className="bi bi-lock me-2 text-primary"></i>
                                كلمة المرور *
                              </label>
                              <div className="input-group">
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  className="form-control"
                                  id="password"
                                  name="password"
                                  value={formData.password}
                                  onChange={handleChange}
                                  required
                                  placeholder="كلمة مرور قوية"
                                  minLength="8"
                                />
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                </button>
                              </div>
                              <div className="form-text">يجب أن تحتوي على 8 أحرف على الأقل</div>
                            </div>

                            <div className="col-md-6 mb-3">
                              <label htmlFor="password_confirm" className="form-label fw-semibold">
                                <i className="bi bi-lock-fill me-2 text-primary"></i>
                                تأكيد كلمة المرور *
                              </label>
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
                        </div>
                      )}

                      {/* Step 2: Additional Info */}
                      {currentStep === 2 && (
                        <div className="fade-in-up">
                          <div className="mb-3">
                            <label htmlFor="bio" className="form-label fw-semibold">
                              <i className="bi bi-chat-quote me-2 text-primary"></i>
                              نبذة شخصية (اختياري)
                            </label>
                            <textarea
                              className="form-control"
                              id="bio"
                              name="bio"
                              value={formData.bio}
                              onChange={handleChange}
                              rows="3"
                              placeholder="اكتب نبذة مختصرة عنك وعن اهتمامك بإعادة التدوير..."
                            ></textarea>
                          </div>

                          <div className="mb-4">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                name="terms"
                                id="terms"
                                checked={formData.terms}
                                onChange={handleChange}
                                required
                              />
                              <label className="form-check-label" htmlFor="terms">
                                أوافق على{' '}
                                <Link to="/terms" className="text-primary text-decoration-none" target="_blank">
                                  الشروط والأحكام
                                </Link>
                                {' '}و{' '}
                                <Link to="/privacy" className="text-primary text-decoration-none" target="_blank">
                                  سياسة الخصوصية
                                </Link>
                              </label>
                            </div>
                          </div>

                          <div className="alert alert-info">
                            <h6 className="fw-semibold mb-2">
                              <i className="bi bi-info-circle me-2"></i>
                              ما ستحصل عليه:
                            </h6>
                            <ul className="mb-0 small">
                              <li>إمكانية بيع المخلفات المنزلية</li>
                              <li>شراء مواد معاد تدويرها</li>
                              <li>تصنيف ذكي للمخلفات</li>
                              <li>محادثات مباشرة مع البائعين</li>
                              <li>تتبع الطلبات والمبيعات</li>
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Navigation Buttons */}
                      <div className="d-flex justify-content-between mt-4">
                        <div>
                          {currentStep > 1 && (
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={prevStep}
                            >
                              <i className="bi bi-arrow-right me-2"></i>
                              السابق
                            </button>
                          )}
                        </div>
                        
                        <div>
                          {currentStep < 2 ? (
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={nextStep}
                              disabled={!formData.full_name || !formData.email || !formData.phone || !formData.location || !formData.password || !formData.password_confirm}
                            >
                              التالي
                              <i className="bi bi-arrow-left ms-2"></i>
                            </button>
                          ) : (
                            <button
                              type="submit"
                              className="btn btn-success"
                              disabled={loading || !formData.terms}
                            >
                              {loading ? (
                                <LoadingSpinner size="sm" text="جاري إنشاء الحساب..." />
                              ) : (
                                <>
                                  <i className="bi bi-check-lg me-2"></i>
                                  إنشاء الحساب
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="text-center mt-4">
                        <p className="text-muted">
                          لديك حساب بالفعل؟{' '}
                          <Link to="/login/individual" className="text-primary text-decoration-none fw-semibold">
                            تسجيل الدخول
                          </Link>
                        </p>
                        
                        <div className="border-top pt-3">
                          <p className="text-muted small mb-2">أنواع حسابات أخرى:</p>
                          <div className="d-flex gap-2 justify-content-center">
                            <Link to="/register/business" className="btn btn-outline-success btn-sm">
                              <i className="bi bi-building me-1"></i>
                              الشركات
                            </Link>
                            <Link to="/register/recycling" className="btn btn-outline-info btn-sm">
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
                <div className="col-lg-5 bg-primary text-white d-flex align-items-center">
                  <div className="p-4">
                    <div className="text-center mb-4">
                      <i className="bi bi-people" style={{ fontSize: '3rem', opacity: 0.9 }}></i>
                      <h4 className="fw-bold mt-3">انضم لمجتمعنا</h4>
                      <p className="opacity-90">
                        آلاف الأفراد يساهمون في بناء مستقبل أخضر
                      </p>
                    </div>

                    <div className="text-center mb-4">
                      <div className="row">
                        <div className="col-4">
                          <div className="bg-white bg-opacity-10 rounded-3 p-2 mb-2">
                            <i className="bi bi-recycle" style={{ fontSize: '1.5rem' }}></i>
                          </div>
                          <h6 className="fw-semibold small">بيع سهل</h6>
                        </div>
                        <div className="col-4">
                          <div className="bg-white bg-opacity-10 rounded-3 p-2 mb-2">
                            <i className="bi bi-cash-coin" style={{ fontSize: '1.5rem' }}></i>
                          </div>
                          <h6 className="fw-semibold small">ربح إضافي</h6>
                        </div>
                        <div className="col-4">
                          <div className="bg-white bg-opacity-10 rounded-3 p-2 mb-2">
                            <i className="bi bi-shield-check" style={{ fontSize: '1.5rem' }}></i>
                          </div>
                          <h6 className="fw-semibold small">آمان تام</h6>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white bg-opacity-10 rounded-3">
                      <h6 className="fw-semibold mb-2">
                        <i className="bi bi-gift me-2"></i>
                        مكافآت التسجيل
                      </h6>
                      <ul className="list-unstyled mb-0 small">
                        <li className="mb-1">
                          <i className="bi bi-check-circle me-2"></i>
                          رصيد ترحيبي 50 جنيه
                        </li>
                        <li className="mb-1">
                          <i className="bi bi-check-circle me-2"></i>
                          تصنيف ذكي مجاني
                        </li>
                        <li className="mb-0">
                          <i className="bi bi-check-circle me-2"></i>
                          دعم فني مجاني
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

export default IndividualRegister;