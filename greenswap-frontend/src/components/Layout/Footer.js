import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-md-6 mb-4">
            <h5 className="mb-3">
              <i className="bi bi-recycle me-2"></i>
              GreenSwap Egypt
            </h5>
            <p className="text-muted">
              منصة رقمية متطورة لربط الأفراد والمؤسسات لإعادة تدوير المخلفات في مصر. 
              نحو بيئة أنظف ومستقبل أفضل.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-muted">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="#" className="text-muted">
                <i className="bi bi-twitter fs-5"></i>
              </a>
              <a href="#" className="text-muted">
                <i className="bi bi-instagram fs-5"></i>
              </a>
              <a href="#" className="text-muted">
                <i className="bi bi-linkedin fs-5"></i>
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6 mb-4">
            <h5>روابط سريعة</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-muted">الرئيسية</Link>
              </li>
              <li className="mb-2">
                <Link to="/items" className="text-muted">المنتجات</Link>
              </li>
              <li className="mb-2">
                <Link to="/ai-classify" className="text-muted">التصنيف الذكي</Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-muted">من نحن</Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 mb-4">
            <h5>الخدمات</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-muted">بيع المخلفات</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted">شراء المواد</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted">الاستشارات</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted">التوصيل</a>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 mb-4">
            <h5>الدعم</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-muted">مركز المساعدة</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted">اتصل بنا</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted">الشروط والأحكام</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted">سياسة الخصوصية</a>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 mb-4">
            <h5>تواصل معنا</h5>
            <ul className="list-unstyled">
              <li className="mb-2 text-muted">
                <i className="bi bi-geo-alt me-2"></i>
                القاهرة، مصر
              </li>
              <li className="mb-2 text-muted">
                <i className="bi bi-telephone me-2"></i>
                +20 123 456 789
              </li>
              <li className="mb-2 text-muted">
                <i className="bi bi-envelope me-2"></i>
                info@greenswap.eg
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4" />

        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="text-muted mb-0">
              © 2024 GreenSwap Egypt. جميع الحقوق محفوظة.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="text-muted mb-0">
              صُنع بـ <i className="bi bi-heart-fill text-danger"></i> في مصر
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;