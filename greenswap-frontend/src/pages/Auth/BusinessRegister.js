import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const BusinessRegister = () => {
  const [formData, setFormData] = useState({
    business_name: '',
    business_license: '',
    business_address: '',
    full_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirm: '',
    location: '',
    business_type: '',
    employee_count: '',
    annual_waste: '',
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
        user_type: 'business'
      });
      
      if (result.success) {
        showSuccess('تم تسجيل شركتك بنجاح! سيتم مراجعة البيانات خلال 24 ساعة');
        navigate('/login/business');
      } else {
        showError(result.error || 'فشل في تسجيل الشركة');
      }
    } catch (error) {
      showError('حدث خطأ أثناء تسجيل الشركة');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-11">
            <div className="card shadow-lg border-0 overflow-hidden">
              <div className="row g-0">
                {/* Left Side - Form */}
                <div className="col-lg-8">
                  <div className="p-5">
                    <div className="text-center mb-4">
                      <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                           style={{ width: '80px', height: '80px' }}>
                        <i className="bi bi-building-add text-success" style={{ fontSize: '2.5rem' }}></i>
                      </div>
                      <h2 className="fw-bold text-dark">تسجيل شركة جديدة</h2>
                      <p className="text-muted">انضم إلى منصة الشركات في GreenSwap Egypt</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="row text-center mb-4">
                      <div className="col-4">
                        <div className={`d-flex align-items-center justify-content-center ${currentStep >= 1 ? 'text-success' : 'text-muted'}`}>
                          <div className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${currentStep >= 1 ? 'bg-success text-white' : 'bg-light'}`} 
                               style={{ width: '30px', height: '30px' }}>
                            <small className="fw-bold">1</small>
                          </div>
                          <span className="fw-semibold small">بيانات الشركة</span>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className={`d-flex align-items-center justify-content-center ${currentStep >= 2 ? 'text-success' : 'text-muted'}`}>
                          <div className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${currentStep >= 2 ? 'bg-success text-white' : 'bg-light'}`} 
                               style={{ width: '30px', height: '30px' }}>
                            <small className="fw-bold">2</small>
                          </div>
                          <span className="fw-semibold small">بيانات المسؤول</span>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className={`d-flex align-items-center justify-content-center ${currentStep >= 3 ? 'text-success' : 'text-muted'}`}>
                          <div className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${currentStep >= 3 ? 'bg-success text-white' : 'bg-light'}`} 
                               style={{ width: '30px', height: '30px' }}>
                            <small className="fw-bold">3</small>
                          </div>
                          <span className="fw-semibold small">تفاصيل إضافية</span>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                      {/* Step 1: Company Info */}
                      {currentStep === 1 && (
                        <div className="fade-in-up">
                          <h5 className="fw-bold text-success mb-4">بيانات الشركة</h5>
                          
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="business_name" className="form-label fw-semibold">
                                <i className="bi bi-building me-2 text-success"></i>
                                اسم الشركة *
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="business_name"
                                name="business_name"
                                value={formData.business_name}
                                onChange={handleChange}
                                required
                                placeholder="اسم الشركة الرسمي"
                              />
                            </div>

                            <div className="col-md-6 mb-3">
                              <label htmlFor="business_license" className="form-label fw-semibold">
                                <i className="bi bi-file-text me-2 text-success"></i>
                                رقم السجل التجاري *
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="business_license"
                                name="business_license"
                                value={formData.business_license}
                                onChange={handleChange}
                                required
                                placeholder="رقم السجل التجاري"
                              />
                            </div>
                          </div>

                          <div className="mb-3">
                            <label htmlFor="business_address" className="form-label fw-semibold">
                              <i className="bi bi-geo-alt me-2 text-success"></i>
                              عنوان الشركة *
                            </label>
                            <textarea
                              className="form-control"
                              id="business_address"
                              name="business_address"
                              value={formData.business_address}
                              onChange={handleChange}
                              required
                              rows="3"
                              placeholder="العنوان التفصيلي للشركة"
                            ></textarea>
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="business_type" className="form-label fw-semibold">
                                <i className="bi bi-diagram-3 me-2 text-success"></i>
                                نوع النشاط *
                              </label>
                              <select
                                className="form-select"
                                id="business_type"
                                name="business_type"
                                value={formData.business_type}
                                onChange={handleChange}
                                required
                              >
                                <option value="">اختر نوع النشاط</option>
                                <option value="manufacturing">تصنيع</option>
                                <option value="trading">تجارة</option>
                                <option value="services">خدمات</option>
                                <option value="construction">إنشاءات</option>
                                <option value="food">صناعات غذائية</option>
                                <option value="textile">نسيج</option>
                                <option value="chemicals">كيماويات</option>
                                <option value="electronics">إلكترونيات</option>
                                <option value="other">أخرى</option>
                              </select>
                            </div>

                            <div className="col-md-6 mb-3">
                              <label htmlFor="employee_count" className="form-label fw-semibold">
                                <i className="bi bi-people me-2 text-success"></i>
                                عدد الموظفين *
                              </label>
                              <select
                                className="form-select"
                                id="employee_count"
                                name="employee_count"
                                value={formData.employee_count}
                                onChange={handleChange}
                                required
                              >
                                <option value="">اختر عدد الموظفين</option>
                                <option value="1-10">1-10 موظفين</option>
                                <option value="11-50">11-50 موظف</option>
                                <option value="51-100">51-100 موظف</option>
                                <option value="101-500">101-500 موظف</option>
                                <option value="500+">أكثر من 500 موظف</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Manager Info */}
                      {currentStep === 2 && (
                        <div className="fade-in-up">
                          <h5 className="fw-bold text-success mb-4">بيانات المسؤول</h5>
                          
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="full_name" className="form-label fw-semibold">
                                <i className="bi bi-person me-2 text-success"></i>
                                اسم المسؤول *
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                placeholder="اسم المسؤول عن الحساب"
                              />
                            </div>

                            <div className="col-md-6 mb-3">
                              <label htmlFor="email" className="form-label fw-semibold">
                                <i className="bi bi-envelope me-2 text-success"></i>
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
                                placeholder="company@example.com"
                              />
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="phone" className="form-label fw-semibold">
                                <i className="bi bi-phone me-2 text-success"></i>
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
                                <i className="bi bi-geo-alt me-2 text-success"></i>
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
                                <i className="bi bi-lock me-2 text-success"></i>
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
                            </div>

                            <div className="col-md-6 mb-3">
                              <label htmlFor="password_confirm" className="form-label fw-semibold">
                                <i className="bi bi-lock-fill me-2 text-success"></i>
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

                      {/* Step 3: Additional Details */}
                      {currentStep === 3 && (
                        <div className="fade-in-up">
                          <h5 className="fw-bold text-success mb-4">تفاصيل إضافية</h5>
                          
                          <div className="mb-3">
                            <label htmlFor="annual_waste" className="form-label fw-semibold">
                              <i className="bi bi-bar-chart me-2 text-success"></i>
                              كمية المخلفات السنوية المتوقعة
                            </label>
                            <select
                              className="form-select"
                              id="annual_waste"
                              name="annual_waste"
                              value={formData.annual_waste}
                              onChange={handleChange}
                            >
                              <option value="">اختر الكمية المتوقعة</option>
                              <option value="less-than-1">أقل من طن واحد</option>
                              <option value="1-10">1-10 أطنان</option>
                              <option value="10-50">10-50 طن</option>
                              <option value="50-100">50-100 طن</option>
                              <option value="100-500">100-500 طن</option>
                              <option value="more-than-500">أكثر من 500 طن</option>
                            </select>
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
                                <Link to="/terms/business" className="text-success text-decoration-none" target="_blank">
                                  شروط وأحكام الشركات
                                </Link>
                                {' '}و{' '}
                                <Link to="/privacy" className="text-success text-decoration-none" target="_blank">
                                  سياسة الخصوصية
                                </Link>
                              </label>
                            </div>
                          </div>

                          <div className="alert alert-warning">
                            <h6 className="fw-semibold mb-2">
                              <i className="bi bi-exclamation-triangle me-2"></i>
                              ملاحظة مهمة:
                            </h6>
                            <p className="mb-0 small">
                              سيتم مراجعة بيانات الشركة من قبل فريقنا خلال 24-48 ساعة. 
                              ستحصل على إشعار بالموافقة أو طلب مستندات إضافية.
                            </p>
                          </div>

                          <div className="alert alert-info">
                            <h6 className="fw-semibold mb-2">
                              <i className="bi bi-gift me-2"></i>
                              مميزات حساب الشركات:
                            </h6>
                            <ul className="mb-0 small">
                              <li>إدارة المخلفات بكميات كبيرة</li>
                              <li>تقارير تحليلية مفصلة</li>
                              <li>خدمات النقل والتوصيل</li>
                              <li>شهادات الاستدامة البيئية</li>
                              <li>دعم فني متخصص</li>
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
                          {currentStep < 3 ? (
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={nextStep}
                              disabled={
                                (currentStep === 1 && (!formData.business_name || !formData.business_license || !formData.business_address || !formData.business_type || !formData.employee_count)) ||
                                (currentStep === 2 && (!formData.full_name || !formData.email || !formData.phone || !formData.location || !formData.password || !formData.password_confirm))
                              }
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
                                <LoadingSpinner size="sm" text="جاري تسجيل الشركة..." />
                              ) : (
                                <>
                                  <i className="bi bi-check-lg me-2"></i>
                                  تسجيل الشركة
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="text-center mt-4">
                        <p className="text-muted">
                          لديك حساب شركة بالفعل؟{' '}
                          <Link to="/login/business" className="text-success text-decoration-none fw-semibold">
                            تسجيل الدخول
                          </Link>
                        </p>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right Side - Info */}
                <div className="col-lg-4 bg-success text-white d-flex align-items-center">
                  <div className="p-4">
                    <div className="text-center mb-4">
                      <i className="bi bi-building" style={{ fontSize: '3rem', opacity: 0.9 }}></i>
                      <h4 className="fw-bold mt-3">منصة الشركات</h4>
                      <p className="opacity-90">
                        حلول متكاملة لإدارة المخلفات الصناعية
                      </p>
                    </div>

                    <div className="p-3 bg-white bg-opacity-10 rounded-3 mb-3">
                      <h6 className="fw-semibold mb-2">
                        <i className="bi bi-award me-2"></i>
                        شهادات ومعايير
                      </h6>
                      <ul className="list-unstyled mb-0 small">
                        <li className="mb-1">• ISO 14001 للإدارة البيئية</li>
                        <li className="mb-1">• شهادة الاستدامة البيئية</li>
                        <li className="mb-0">• تقارير الأثر البيئي</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-white bg-opacity-10 rounded-3">
                      <h6 className="fw-semibold mb-2">
                        <i className="bi bi-headset me-2"></i>
                        الدعم المتخصص
                      </h6>
                      <ul className="list-unstyled mb-0 small">
                        <li className="mb-1">• مدير حساب مخصص</li>
                        <li className="mb-1">• استشارات بيئية</li>
                        <li className="mb-0">• دعم فني 24/7</li>
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

export default BusinessRegister;