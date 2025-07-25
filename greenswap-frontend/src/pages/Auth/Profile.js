import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import api from '../../utils/api';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    business_name: '',
    business_address: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [stats, setStats] = useState({});
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        business_name: user.business_name || '',
        business_address: user.business_address || ''
      });
      setAvatarPreview(user.avatar_url);
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/auth/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (profileData[key]) {
          formData.append(key, profileData[key]);
        }
      });
      
      if (avatar) {
        formData.append('avatar', avatar);
      }

      const result = await updateProfile(formData);
      
      if (result.success) {
        showSuccess('تم تحديث الملف الشخصي بنجاح');
      } else {
        showError(result.error);
      }
    } catch (error) {
      showError('حدث خطأ أثناء تحديث الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      showError('كلمتا المرور الجديدة غير متطابقتين');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/change-password/', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });

      showSuccess('تم تغيير كلمة المرور بنجاح');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      showError(error.response?.data?.error || 'فشل في تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LoadingSpinner centered text="جاري تحميل الملف الشخصي..." />;
  }

  return (
    <div className="container py-5 page-container">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card glass-card border-0">
            <div className="card-body text-center">
              <div className="position-relative d-inline-block mb-3">
                <img
                  src={avatarPreview || '/api/placeholder/120/120'}
                  alt="الصورة الشخصية"
                  className="rounded-circle"
                  width="120"
                  height="120"
                  style={{ objectFit: 'cover' }}
                />
                <label 
                  htmlFor="avatar-upload"
                  className="position-absolute bottom-0 end-0 btn btn-primary btn-sm rounded-circle"
                  style={{ width: '35px', height: '35px' }}
                >
                  <i className="bi bi-camera"></i>
                </label>
                <input
                  type="file"
                  id="avatar-upload"
                  className="d-none"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
              
              <h5 className="fw-bold">{user.full_name}</h5>
              <p className="text-muted mb-2">{user.email}</p>
              
              {user.is_verified && (
                <span className="badge bg-success mb-3">
                  <i className="bi bi-patch-check me-1"></i>
                  حساب موثق
                </span>
              )}
              
              <div className="d-flex justify-content-around text-center">
                <div>
                  <h6 className="fw-bold text-primary">{stats.total_items_posted || 0}</h6>
                  <small className="text-muted">منتج</small>
                </div>
                <div>
                  <h6 className="fw-bold text-success">{stats.total_orders_made || 0}</h6>
                  <small className="text-muted">طلب</small>
                </div>
                <div>
                  <h6 className="fw-bold text-warning">{stats.rating_average || 0}</h6>
                  <small className="text-muted">تقييم</small>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="list-group mt-4">
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="bi bi-person me-2"></i>
              الملف الشخصي
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <i className="bi bi-lock me-2"></i>
              تغيير كلمة المرور
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <i className="bi bi-gear me-2"></i>
              الإعدادات
            </button>
            <button
              className={`list-group-item list-group-item-action ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <i className="bi bi-graph-up me-2"></i>
              الإحصائيات
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-9">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                {activeTab === 'profile' && 'تحديث الملف الشخصي'}
                {activeTab === 'password' && 'تغيير كلمة المرور'}
                {activeTab === 'settings' && 'إعدادات الحساب'}
                {activeTab === 'stats' && 'إحصائيات الحساب'}
              </h5>
            </div>
            
            <div className="card-body">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">الاسم الكامل</label>
                      <input
                        type="text"
                        className="form-control"
                        name="full_name"
                        value={profileData.full_name}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">البريد الإلكتروني</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">رقم الهاتف</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">الموقع</label>
                      <input
                        type="text"
                        className="form-control"
                        name="location"
                        value={profileData.location}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>

                  {user.user_type !== 'individual' && (
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">اسم المؤسسة</label>
                        <input
                          type="text"
                          className="form-control"
                          name="business_name"
                          value={profileData.business_name}
                          onChange={handleProfileChange}
                        />
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label">عنوان المؤسسة</label>
                        <input
                          type="text"
                          className="form-control"
                          name="business_address"
                          value={profileData.business_address}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">نبذة شخصية</label>
                    <textarea
                      className="form-control"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      rows="4"
                      placeholder="اكتب نبذة مختصرة عنك..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" text="جاري التحديث..." />
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        حفظ التغييرات
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-3">
                    <label className="form-label">كلمة المرور الحالية</label>
                    <input
                      type="password"
                      className="form-control"
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      className="form-control"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      required
                      minLength="8"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">تأكيد كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-warning"
                    disabled={loading}
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" text="جاري التغيير..." />
                    ) : (
                      <>
                        <i className="bi bi-shield-lock me-2"></i>
                        تغيير كلمة المرور
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h6 className="fw-bold mb-3">إعدادات الإشعارات</h6>
                  
                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="emailNotifications" defaultChecked />
                    <label className="form-check-label" htmlFor="emailNotifications">
                      إشعارات البريد الإلكتروني
                    </label>
                  </div>
                  
                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="pushNotifications" defaultChecked />
                    <label className="form-check-label" htmlFor="pushNotifications">
                      الإشعارات المباشرة
                    </label>
                  </div>
                  
                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="smsNotifications" />
                    <label className="form-check-label" htmlFor="smsNotifications">
                      إشعارات الرسائل النصية
                    </label>
                  </div>

                  <hr />

                  <h6 className="fw-bold mb-3">إعدادات الخصوصية</h6>
                  
                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="showEmail" />
                    <label className="form-check-label" htmlFor="showEmail">
                      إظهار البريد الإلكتروني للآخرين
                    </label>
                  </div>
                  
                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="showPhone" />
                    <label className="form-check-label" htmlFor="showPhone">
                      إظهار رقم الهاتف للآخرين
                    </label>
                  </div>

                  <button className="btn btn-success">
                    <i className="bi bi-check-lg me-2"></i>
                    حفظ الإعدادات
                  </button>
                </div>
              )}

              {/* Stats Tab */}
              {activeTab === 'stats' && (
                <div>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                          <i className="bi bi-box-seam" style={{ fontSize: '2rem' }}></i>
                          <h4 className="mt-2">{stats.total_items_posted || 0}</h4>
                          <p className="mb-0">منتج منشور</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6 mb-4">
                      <div className="card bg-success text-white">
                        <div className="card-body text-center">
                          <i className="bi bi-cart-check" style={{ fontSize: '2rem' }}></i>
                          <h4 className="mt-2">{stats.total_orders_made || 0}</h4>
                          <p className="mb-0">طلب مقدم</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6 mb-4">
                      <div className="card bg-warning text-white">
                        <div className="card-body text-center">
                          <i className="bi bi-star-fill" style={{ fontSize: '2rem' }}></i>
                          <h4 className="mt-2">{stats.rating_average || 0}</h4>
                          <p className="mb-0">متوسط التقييم</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6 mb-4">
                      <div className="card bg-info text-white">
                        <div className="card-body text-center">
                          <i className="bi bi-calendar" style={{ fontSize: '2rem' }}></i>
                          <h4 className="mt-2">{stats.member_since || 'جديد'}</h4>
                          <p className="mb-0">عضو منذ</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;