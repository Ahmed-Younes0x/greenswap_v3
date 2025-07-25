import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatPrice } from '../utils/helpers';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, categoriesRes, statsRes] = await Promise.all([
          api.get('/items/featured/'),
          api.get('/items/categories/'),
          api.get('/items/stats/')
        ]);

        setFeaturedItems(itemsRes.data.results || itemsRes.data);
        setCategories(categoriesRes.data.results || categoriesRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner centered text="جاري تحميل الصفحة الرئيسية..." />;
  }

  return (
    <div>
      {/* Animated Background */}
      <div className="particles-bg">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      
      {/* Hero Section */}
      <section className="hero-section animated-bg">
        <div className="container">
          <div className="row align-items-center min-vh-75">
            <div className="col-lg-6">
              <div className="hero-content slide-in-left">
                <h1 className="display-4 fw-bold mb-4 text-white">
                  حول مخلفاتك إلى ثروة مع GreenSwap
                </h1>
                <p className="lead mb-4 text-white-75">
                  منصة رقمية متطورة لربط الأفراد والمؤسسات لإعادة تدوير المخلفات في مصر. 
                  ساهم في بناء مستقبل أخضر ومستدام.
                </p>
                <div className="d-flex gap-3 flex-wrap">
                  <Link to="/auth" className="btn btn-light btn-lg px-4 py-3">
                    <i className="bi bi-rocket-takeoff me-2"></i>
                    ابدأ الآن
                  </Link>
                  <Link to="/ai-classify" className="btn btn-outline-light btn-lg px-4 py-3">
                    <i className="bi bi-robot me-2"></i>
                    تصنيف ذكي
                  </Link>
                  <Link to="/ai-chat" className="btn btn-outline-light btn-lg px-4 py-3">
                    <i className="bi bi-chat-dots me-2"></i>
                    البوت الذكي
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="text-center hero-animation slide-in-right">
                <div className="hero-icon-container">
                  <i className="bi bi-recycle hero-main-icon"></i>
                  <div className="floating-icons">
                    <i className="bi bi-leaf floating-icon-1"></i>
                    <i className="bi bi-droplet floating-icon-2"></i>
                    <i className="bi bi-sun floating-icon-3"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-wave"></div>
      </section>

      {/* Stats Section */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-3 col-sm-6">
              <div className="stat-card h-100 glass-card hover-lift-lg">
                <div className="stat-icon">
                  <i className="bi bi-box-seam"></i>
                </div>
                <div className="stat-number">{formatPrice(stats.total_items || 0)}</div>
                <div className="stat-label">إجمالي المنتجات</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="stat-card h-100 glass-card hover-lift-lg">
                <div className="stat-icon">
                  <i className="bi bi-people"></i>
                </div>
                <div className="stat-number">{formatPrice(stats.total_users || 0)}</div>
                <div className="stat-label">المستخدمين المسجلين</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="stat-card h-100 glass-card hover-lift-lg">
                <div className="stat-icon">
                  <i className="bi bi-check-circle"></i>
                </div>
                <div className="stat-number">{formatPrice(stats.completed_orders || 0)}</div>
                <div className="stat-label">الطلبات المكتملة</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="stat-card h-100 glass-card hover-lift-lg">
                <div className="stat-icon">
                  <i className="bi bi-tags"></i>
                </div>
                <div className="stat-number">{formatPrice(stats.categories_count || 0)}</div>
                <div className="stat-label">فئات المنتجات</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-5 page-container">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-gradient">فئات المنتجات</h2>
            <p className="lead text-muted">اكتشف الفئات المختلفة للمخلفات القابلة لإعادة التدوير</p>
          </div>
          
          <div className="row g-4">
            {categories.slice(0, 6).map((category, index) => (
              <div key={category.id} className="col-lg-4 col-md-6">
                <Link to={`/items?category=${category.id}`} className="text-decoration-none">
                  <div className={`category-card glass-card hover-lift-lg slide-in-bottom`} style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="category-icon" style={{ color: category.color || '#28a745' }}>
                      <i className={`bi bi-${category.icon || 'box'}`}></i>
                    </div>
                    <h5 className="fw-bold text-dark mb-2">{category.name}</h5>
                    <p className="text-muted mb-3">{category.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="badge bg-primary">
                        {category.items_count || 0} منتج
                      </span>
                      <i className="bi bi-arrow-left text-primary"></i>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-5">
            <Link to="/items" className="btn btn-outline-primary btn-lg">
              <i className="bi bi-grid me-2"></i>
              عرض جميع الفئات
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-gradient">المنتجات المميزة</h2>
            <p className="lead text-muted">أحدث المنتجات المضافة للمنصة</p>
          </div>
          
          <div className="row g-4">
            {featuredItems.slice(0, 8).map((item, index) => (
              <div key={item.id} className="col-lg-3 col-md-6">
                <div className={`product-card glass-card hover-lift-lg slide-in-bottom`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="product-image-container">
                    <img 
                      src={item.primary_image || 'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=300'} 
                      alt={item.title}
                      className="product-image"
                      loading="lazy"
                    />
                    <div className="product-badges">
                      {item.is_featured && (
                        <span className="badge bg-warning">
                          <i className="bi bi-star-fill me-1"></i>
                          مميز
                        </span>
                      )}
                      {item.is_urgent && (
                        <span className="badge bg-danger ms-1">
                          <i className="bi bi-clock-fill me-1"></i>
                          عاجل
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <h6 className="card-title fw-bold mb-2">{item.title}</h6>
                    <p className="card-text text-muted small mb-3">
                      {item.description?.substring(0, 80)}...
                    </p>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <span className="fw-bold text-primary fs-5">
                          {formatPrice(item.price)} جنيه
                        </span>
                        {item.is_negotiable && (
                          <small className="text-muted d-block">قابل للتفاوض</small>
                        )}
                      </div>
                      <div className="text-end">
                        <div className="d-flex align-items-center text-muted small mb-1">
                          <i className="bi bi-eye me-1"></i>
                          {item.views_count || 0}
                          <i className="bi bi-heart me-1 ms-2"></i>
                          {item.likes_count || 0}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <span className="badge bg-secondary me-2">
                        {item.category_name}
                      </span>
                    </div>
                    
                    <div className="d-flex align-items-center text-muted small mb-3">
                      <i className="bi bi-geo-alt me-1"></i>
                      {item.location}
                    </div>
                  </div>
                  
                  <div className="card-footer bg-transparent border-0 pt-0">
                    <Link
                      to={`/items/${item.id}`}
                      className="btn btn-primary w-100 btn-hover-lift"
                    >
                      <i className="bi bi-eye me-2"></i>
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-5">
            <Link to="/items" className="btn btn-primary btn-lg">
              <i className="bi bi-collection me-2"></i>
              عرض جميع المنتجات
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 page-container">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-gradient">لماذا GreenSwap؟</h2>
            <p className="lead text-muted">مميزات تجعلنا الخيار الأفضل لإعادة التدوير</p>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="feature-card glass-card text-center slide-in-left hover-glow">
                <div className="feature-icon bg-primary">
                  <i className="bi bi-robot text-white"></i>
                </div>
                <h5 className="fw-bold mb-3">ذكاء اصطناعي</h5>
                <p className="text-muted">
                  تصنيف تلقائي للمخلفات باستخدام أحدث تقنيات الذكاء الاصطناعي
                </p>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6">
              <div className="feature-card glass-card text-center slide-in-bottom hover-glow" style={{ animationDelay: '0.1s' }}>
                <div className="feature-icon bg-success">
                  <i className="bi bi-shield-check text-white"></i>
                </div>
                <h5 className="fw-bold mb-3">آمان وموثوقية</h5>
                <p className="text-muted">
                  نظام تقييمات شامل وحماية كاملة لبياناتك الشخصية
                </p>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6">
              <div className="feature-card glass-card text-center slide-in-right hover-glow" style={{ animationDelay: '0.2s' }}>
                <div className="feature-icon bg-info">
                  <i className="bi bi-chat-dots text-white"></i>
                </div>
                <h5 className="fw-bold mb-3">تواصل مباشر</h5>
                <p className="text-muted">
                  محادثات فورية بين المشترين والبائعين لضمان أفضل تجربة
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 gradient-bg-4 text-white">
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="display-5 fw-bold mb-4">ابدأ رحلتك الخضراء اليوم</h2>
              <p className="lead mb-4">
                انضم إلى آلاف المستخدمين الذين يساهمون في بناء مستقبل أخضر ومستدام
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link to="/auth" className="btn btn-light btn-lg px-4 py-3">
                  <i className="bi bi-person-plus me-2"></i>
                  إنشاء حساب مجاني
                </Link>
                <Link to="/ai-classify" className="btn btn-outline-light btn-lg px-4 py-3">
                  <i className="bi bi-magic me-2"></i>
                  جرب التصنيف الذكي
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;