import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light glass-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-recycle me-2 text-primary" style={{ fontSize: '2rem' }}></i>
          <span className="fw-bold text-primary">GreenSwap Egypt</span>
        </Link>

        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">الرئيسية</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/items">المنتجات</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/ai-classify">تصنيف ذكي</Link>
            </li>
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown"
              >
                خدمات AI
              </a>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/ai-classify">
                  <i className="bi bi-camera me-2"></i>تصنيف الصور
                </Link></li>
                <li><Link className="dropdown-item" to="/ai-chat">
                  <i className="bi bi-robot me-2"></i>البوت الذكي
                </Link></li>
                <li><Link className="dropdown-item" to="/ai-analytics">
                  <i className="bi bi-graph-up me-2"></i>تحليلات AI
                </Link></li>
              </ul>
            </li>
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/orders">طلباتي</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/chat">المحادثات</Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link position-relative" to="/notifications">
                    <i className="bi bi-bell"></i>
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
                
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle d-flex align-items-center" 
                    href="#" 
                    role="button" 
                    data-bs-toggle="dropdown"
                  >
                    <img 
                      src={user.avatar_url || 'http://localhost:8000/media/avatar/default.jpg'} 
                      alt="Profile" 
                      className="rounded-circle me-2"
                      width="32" 
                      height="32"
                    />
                    {user.full_name}
                  </a>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/profile">الملف الشخصي</Link></li>
                    <li><Link className="dropdown-item" to="/add-item">إضافة منتج</Link></li>
                    <li><Link className="dropdown-item" to="/reports">البلاغات</Link></li>
                    {isAdmin && (
                      <>
                        <li><hr className="dropdown-divider" /></li>
                        <li><Link className="dropdown-item" to="/dashboard">لوحة التحكم</Link></li>
                      </>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        تسجيل الخروج
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/auth">تسجيل الدخول</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary ms-2" to="/auth">إنشاء حساب</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;