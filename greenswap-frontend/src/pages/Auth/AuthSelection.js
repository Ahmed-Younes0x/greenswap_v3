import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const AuthSelection = () => {
    const { user } = useAuth(); // assumes you're using an AuthContext
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/'); // redirect to homepage if already logged in
    }
  }, [user, navigate]);
  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="text-center mb-5">
              <i className="bi bi-recycle text-primary" style={{ fontSize: '4rem' }}></i>
              <h1 className="display-5 fw-bold mt-3">مرحباً بك في GreenSwap Egypt</h1>
              <p className="lead text-muted">اختر نوع حسابك للبدء في رحلة إعادة التدوير</p>
            </div>

            <div className="row g-4">
              {/* Individual Account */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-lg h-100 card-hover">
                  <div className="card-body text-center p-5">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                         style={{ width: '100px', height: '100px' }}>
                      <i className="bi bi-person-circle text-primary" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h3 className="fw-bold text-dark mb-3">الأفراد</h3>
                    <p className="text-muted mb-4">
                      للأشخاص الذين يريدون بيع أو شراء المخلفات المنزلية والشخصية
                    </p>
                    
                    <div className="mb-4">
                      <h6 className="fw-semibold text-primary mb-3">المميزات:</h6>
                      <ul className="list-unstyled text-start">
                        <li className="mb-2">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          بيع المخلفات المنزلية
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          شراء مواد معاد تدويرها
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          تصنيف ذكي مجاني
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          محادثات مباشرة
                        </li>
                      </ul>
                    </div>

                    <div className="d-grid gap-2">
                      <Link to="/login/individual" className="btn btn-primary btn-lg">
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        تسجيل الدخول
                      </Link>
                      <Link to="/register/individual" className="btn btn-outline-primary">
                        <i className="bi bi-person-plus me-2"></i>
                        إنشاء حساب جديد
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Account */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-lg h-100 card-hover">
                  <div className="card-body text-center p-5">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                         style={{ width: '100px', height: '100px' }}>
                      <i className="bi bi-building text-success" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h3 className="fw-bold text-dark mb-3">الشركات</h3>
                    <p className="text-muted mb-4">
                      للشركات والمؤسسات التي تحتاج لإدارة المخلفات الصناعية بكميات كبيرة
                    </p>
                    
                    <div className="mb-4">
                      <h6 className="fw-semibold text-success mb-3">المميزات:</h6>
                      <ul className="list-unstyled text-start">
                        <li className="mb-2">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          إدارة كميات كبيرة
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          تقارير تحليلية مفصلة
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          خدمات النقل والتوصيل
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          شهادات الاستدامة
                        </li>
                      </ul>
                    </div>

                    <div className="d-grid gap-2">
                      <Link to="/login/business" className="btn btn-success btn-lg">
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        تسجيل الدخول
                      </Link>
                      <Link to="/register/business" className="btn btn-outline-success">
                        <i className="bi bi-building-add me-2"></i>
                        تسجيل شركة جديدة
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recycling Center Account */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-lg h-100 card-hover">
                  <div className="card-body text-center p-5">
                    <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                         style={{ width: '100px', height: '100px' }}>
                      <i className="bi bi-recycle text-info" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h3 className="fw-bold text-dark mb-3">مراكز التدوير</h3>
                    <p className="text-muted mb-4">
                      لمراكز ومصانع إعادة التدوير المتخصصة في معالجة وتحويل المخلفات
                    </p>
                    
                    <div className="mb-4">
                      <h6 className="fw-semibold text-info mb-3">المميزات:</h6>
                      <ul className="list-unstyled text-start">
                        <li className="mb-2">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          إدارة عمليات المعالجة
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          تتبع الكميات والمواد
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          تقارير الإنتاج
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          شهادات الجودة
                        </li>
                      </ul>
                    </div>

                    <div className="d-grid gap-2">
                      <Link to="/login/recycling" className="btn btn-info btn-lg">
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        تسجيل الدخول
                      </Link>
                      <Link to="/register/recycling" className="btn btn-outline-info">
                        <i className="bi bi-recycle me-2"></i>
                        تسجيل مركز جديد
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-5">
              <p className="text-muted">
                <i className="bi bi-shield-check text-success me-2"></i>
                جميع أنواع الحسابات آمنة ومحمية بأحدث تقنيات الأمان
              </p>
              <Link to="/" className="btn btn-outline-secondary">
                <i className="bi bi-house me-2"></i>
                العودة للصفحة الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSelection;