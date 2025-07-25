import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const RecyclingRegister = () => {
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
    capacity: '',
    materials: [],
    certifications: '',
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

  const handleMaterialChange = (material) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.includes(material)
        ? prev.materials.filter(m => m !== material)
        : [...prev.materials, material]
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
        user_type: 'recycling_center'
      });
      
      if (result.success) {
        showSuccess('تم تسجيل مركز التدوير بنجاح! سيتم مراجعة البيانات خلال 48 ساعة');
        navigate('/login/recycling');
      } else {
        showError(result.error || 'فشل في تسجيل مركز التدوير');
      }
    } catch (error) {
      showError('حدث خطأ أثناء تسجيل مركز التدوير');
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

  const materialOptions = [
    { value: 'plastic', label: 'بلاستيك', icon: 'cup-straw' },
    { value: 'metal', label: 'معادن', icon: 'gear' },
    { value: 'paper', label: 'ورق وكرتون', icon: 'file-text' },
    { value: 'glass', label: 'زجاج', icon: 'cup' },
    { value: 'electronics', label: 'إلكترونيات', icon: 'phone' },
    { value: 'textile', label: 'نسيج', icon: 'scissors' },
    { value: 'organic', label: 'عضوي', icon: 'flower1' },
    { value: 'hazardous', label: 'مواد خطرة', icon: 'exclamation-triangle' }
  ];

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
                      <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                           style={{ width: '80px', height: '80px' }}>
                        <i className="bi bi-recycle text-info" style={{ fontSize: '2.5rem' }}></i>
                      </div>
                      <h2 className="fw-bold text-dark">تسجيل مركز تدوير جديد</h2>
                      <p className="text-muted">انضم إلى شبكة مراكز التدوير في GreenSwap Egypt</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="row text-center mb-4">
                      <div className="col-4">
                        <div className={`d-flex align-items-center justify-content-center ${currentStep >= 1 ? 'text-info' : 'text-muted'}`}>
                          <div className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${currentStep >= 1 ? 'bg-info text-white' : 'bg-light'}`} 
                               style={{ width: '30px', height: '30px' }}>
                            <small className="fw-bold">1</small>
                          </div>
                          <span className="fw-semibold small">بيانات المركز</span>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className={`d-flex align-items-center justify-content-center ${currentStep >= 2 ? 'text-info' : 'text-muted'}`}>
                          <div className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${currentStep >= 2 ? 'bg-info text-white' : 'bg-light'}`} 
                               style={{ width: '30px', height: '30px' }}>
                            <small className="fw-bold">2</small>
                          </div>
                          <span className="fw-semibold small">بيانات المسؤول</span>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className={`d-flex align-items-center justify-content-center ${currentStep >= 3 ? 'text-info' : 'text-muted'}`}>
                          <div className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${currentStep >= 3 ? 'bg-info text-white' : 'bg-light'}`} 
                               style={{ width: '30px', height: '30px' }}>
                            <small className="fw-bold">3</small>
                          </div>
                          <span className="fw-semibold small">القدرات والتخصص</span>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                      {/* Step 1: Center Info */}
                      {currentStep === 1 && (
                        <div className="fade-in-up">
                          <h5 className="fw-bold text-info mb-4">بيانات مركز التدوير</h5>
                          
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="business_name" className="form-label fw-semibold">
                                <i className="bi bi-recycle me-2 text-info"></i>
                                اسم مركز التدوير *
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="business_name"
                                name="business_name"
                                value={formData.business_name}
                                onChange={handleChange}
                                required
                                placeholder="اسم مركز التدوير الرسمي"
                              />
                            </div>

                            <div className="col-md-6 mb-3">
                              <label htmlFor="business_license" className="form-label fw-semibold">
                                <i className="bi bi-file-text me-2 text-info"></i>
                                رقم الترخيص *
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="business_license"
                                name="business_license"
                                value={formData.business_license}
                                onChange={handleChange}
                                required
                                placeholder="رقم ترخيص مزاولة النشاط"
                              />
                            </div>
                          </div>

                          <div className="mb-3">
                            <label htmlFor="business_address" className="form-label fw-semibold">
                              <i className="bi bi-geo-alt me-2 text-info"></i>
                              عنوان المركز *
                            </label>
                            <textarea
                              className="form-control"
                              id="business_address"
                              name="business_address"
                              value={formData.business_address}
                              onChange={handleChange}
                              required
                              rows="3"
                              placeholder="العنوان التفصيلي لمركز التدوير"
                            ></textarea>
                          </div>

                          <div className="mb-3">
                            <label htmlFor="location" className="form-label fw-semibold">
                              <i className="bi bi-map me-2 text-info"></i>
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
                      )}

                      {/* Step 2: Manager Info */}
                      {currentStep === 2 && (
                        <div className="fade-in-up">
                          <h5 className="fw-bold text-info mb-4">بيانات المسؤول</h5>
                          
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="full_name" className="form-label fw-semibold">
                                <i className="bi bi-person me-2 text-info"></i>
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
                                placeholder="اسم مدير المركز"
                              />
                            </div>

                            <div className="col-md-6 mb-3">
                              <label htmlFor="email" className="form-label fw-semibold">
                                <i className="bi bi-envelope me-2 text-info"></i>
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
                                placeholder="center@recycling.com"
                              />
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="phone" className="form-label fw-semibold">
                                <i className="bi bi-phone me-2 text-info"></i>
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
                              <label htmlFor="certifications" className="form-label fw-semibold">
                                <i className="bi bi-award me-2 text-info"></i>
                                الشهادات والتراخيص
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="certifications"
                                name="certifications"
                                value={formData.certifications}
                                onChange={handleChange}
                                placeholder="ISO 14001, تصريح وزارة البيئة..."
                              />
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="password" className="form-label fw-semibold">
                                <i className="bi bi-lock me-2 text-info"></i>
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
                                <i className="bi bi-lock-fill me-2 text-info"></i>
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

                      {/* Step 3: Capabilities */}
                      {currentStep === 3 && (
                        <div className="fade-in-up">
                          <h5 className="fw-bold text-info mb-4">القدرات والتخصص</h5>
                          
                          <div className="mb-3">
                            <label className="form-label fw-semibold">
                              <i className="bi bi-collection me-2 text-info"></i>
                              أنواع المواد التي يتم تدويرها *
                            </label>
                            <div className="row g-2">
                              {materialOptions.map(material => (
                                <div key={material.value} className="col-md-3 col-6">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`material-${material.value}`}
                                      checked={formData.materials.includes(material.value)}
                                      onChange={() => handleMaterialChange(material.value)}
                                    />
                                    <label className="form-check-label" htmlFor={`material-${material.value}`}>
                                      <i className={`bi bi-${material.icon} me-2`}></i>
                                      {material.label}
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mb-3">
                            <label htmlFor="capacity" className="form-label fw-semibold">
                              <i className="bi bi-speedometer me-2 text-info"></i>
                              الطاقة الإنتاجية الشهرية
                            </label>
                            <select
                              className="form-select"
                              id="capacity"
                              name="capacity"
                              value={formData.capacity}
                              onChange={handleChange}
                            >
                              <option value="">اختر الطاقة الإنتاجية</option>
                              <option value="less-than-10">أقل من 10 أطنان</option>
                              <option value="10-50">10-50 طن</option>
                              <option value="50-100">50-100 طن</option>
                              <option value="100-500">100-500 طن</option>
                              <option value="500-1000">500-1000 طن</option>
                              <option value="more-than-1000">أكثر من 1000 طن</option>
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
                                <Link to="/terms/recycling" className="text-info text-decoration-none" target="_blank">
                                  شروط وأحكام مراكز التدوير
                                </Link>
                                {' '}و{' '}
                                <Link to="/privacy" className="text-info text-decoration-none" target="_blank">
                                  سياسة الخصوصية
                                </Link>
                              </label>
                            </div>
                          </div>

                          <div className="alert alert-warning">
                            <h6 className="fw-semibold mb-2">
                              <i className="bi bi-exclamation-triangle me-2"></i>
                              عملية المراجعة:
                            </h6>
                            <p className="mb-0 small">
                              سيتم مراجعة بيانات مركز التدوير من قبل فريق متخصص خلال 48-72 ساعة. 
                              قد نطلب مستندات إضافية للتحقق من التراخيص والشهادات.
                            </p>
                          </div>

                          <div className="alert alert-info">
                            <h6 className="fw-semibold mb-2">
                              <i className="bi bi-star me-2"></i>
                              مميزات منصة مراكز التدوير:
                            </h6>
                            <ul className="mb-0 small">
                              <li>إدارة عمليات المعالجة والتدوير</li>
                              <li>تتبع الكميات والمواد الواردة</li>
                              <li>تقارير الإنتاج والكفاءة</li>
                              <li>إدارة العمالة والمعدات</li>
                              <li>شهادات الجودة والمطابقة</li>
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
                              className="btn btn-info"
                              onClick={nextStep}
                              disabled={
                                (currentStep === 1 && (!formData.business_name || !formData.business_license || !formData.business_address || !formData.location)) ||
                                (currentStep === 2 && (!formData.full_name || !formData.email || !formData.phone || !formData.password || !formData.password_confirm))
                              }
                            >
                              التالي
                              <i className="bi bi-arrow-left ms-2"></i>
                            </button>
                          ) : (
                            <button
                              type="submit"
                              className="btn btn-info"
                              disabled={loading || !formData.terms || formData.materials.length === 0}
                            >
                              {loading ? (
                                <LoadingSpinner size="sm" text="جاري تسجيل المركز..." />
                              ) : (
                                <>
                                  <i className="bi bi-check-lg me-2"></i>
                                  تسجيل مركز التدوير
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="text-center mt-4">
                        <p className="text-muted">
                          لديك حساب مركز بالفعل؟{' '}
                          <Link to="/login/recycling" className="text-info text-decoration-none fw-semibold">
                            تسجيل الدخول
                          </Link>
                        </p>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right Side - Info */}
                <div className="col-lg-4 bg-info text-white d-flex align-items-center">
                  <div className="p-4">
                    <div className="text-center mb-4">
                      <i className="bi bi-recycle" style={{ fontSize: '3rem', opacity: 0.9 }}></i>
                      <h4 className="fw-bold mt-3">شبكة التدوير</h4>
                      <p className="opacity-90">
                        انضم لشبكة مراكز التدوير المعتمدة
                      </p>
                    </div>

                    <div className="p-3 bg-white bg-opacity-10 rounded-3 mb-3">
                      <h6 className="fw-semibold mb-2">
                        <i className="bi bi-graph-up me-2"></i>
                        نمو مستمر
                      </h6>
                      <ul className="list-unstyled mb-0 small">
                        <li className="mb-1">• زيادة الطلب على المواد المعاد تدويرها</li>
                        <li className="mb-1">• شراكات مع الشركات الكبرى</li>
                        <li className="mb-0">• دعم حكومي للقطاع</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-white bg-opacity-10 rounded-3">
                      <h6 className="fw-semibold mb-2">
                        <i className="bi bi-shield-check me-2"></i>
                        ضمانات الجودة
                      </h6>
                      <ul className="list-unstyled mb-0 small">
                        <li className="mb-1">• معايير دولية للجودة</li>
                        <li className="mb-1">• فحص دوري للمنتجات</li>
                        <li className="mb-0">• شهادات مطابقة معتمدة</li>
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

export default RecyclingRegister;