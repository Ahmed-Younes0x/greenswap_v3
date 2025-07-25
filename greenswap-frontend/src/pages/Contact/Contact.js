import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Contact = () => {
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [loading, setLoading] = useState(false);

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showSuccess('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        type: 'general'
      });
    } catch (error) {
      showError('فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: 'geo-alt',
      title: 'العنوان',
      details: ['القاهرة، مصر', 'شارع التحرير، وسط البلد'],
      color: 'primary'
    },
    {
      icon: 'telephone',
      title: 'الهاتف',
      details: ['+20 123 456 789', '+20 987 654 321'],
      color: 'success'
    },
    {
      icon: 'envelope',
      title: 'البريد الإلكتروني',
      details: ['info@greenswap.eg', 'support@greenswap.eg'],
      color: 'info'
    },
    {
      icon: 'clock',
      title: 'ساعات العمل',
      details: ['الأحد - الخميس: 9:00 ص - 6:00 م', 'الجمعة - السبت: 10:00 ص - 4:00 م'],
      color: 'warning'
    }
  ];

  const departments = [
    { value: 'general', label: 'استفسار عام' },
    { value: 'technical', label: 'دعم فني' },
    { value: 'business', label: 'شراكات تجارية' },
    { value: 'media', label: 'إعلام وصحافة' },
    { value: 'complaint', label: 'شكوى' }
  ];

  const faqs = [
    {
      question: 'كيف يمكنني بدء بيع المخلفات؟',
      answer: 'يمكنك إنشاء حساب مجاني، ثم إضافة منتجاتك مع الصور والأوصاف. سيساعدك نظام التصنيف الذكي في تحديد الفئة المناسبة.'
    },
    {
      question: 'هل الخدمة مجانية؟',
      answer: 'نعم، التسجيل والاستخدام الأساسي مجاني. نحصل على عمولة صغيرة فقط عند إتمام البيع.'
    },
    {
      question: 'كيف يعمل التصنيف الذكي؟',
      answer: 'نستخدم تقنيات الذكاء الاصطناعي لتحليل صور المخلفات وتصنيفها تلقائياً مع اقتراح السعر المناسب.'
    },
    {
      question: 'هل يمكن للشركات الانضمام؟',
      answer: 'بالطبع! لدينا حلول مخصصة للشركات والمؤسسات لإدارة المخلفات الصناعية بكميات كبيرة.'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">تواصل معنا</h1>
              <p className="lead mb-4">
                نحن هنا لمساعدتك! تواصل معنا لأي استفسارات أو اقتراحات أو شكاوى
              </p>
            </div>
            <div className="col-lg-6 text-center">
              <i className="bi bi-headset" style={{ fontSize: '8rem', opacity: 0.8 }}></i>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            {contactInfo.map((info, index) => (
              <div key={index} className="col-lg-3 col-md-6 mb-4">
                <div className="card border-0 shadow-sm h-100 text-center">
                  <div className="card-body p-4">
                    <div className={`bg-${info.color} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`} 
                         style={{ width: '60px', height: '60px' }}>
                      <i className={`bi bi-${info.icon} text-${info.color} fs-4`}></i>
                    </div>
                    <h5 className="fw-bold mb-3">{info.title}</h5>
                    {info.details.map((detail, i) => (
                      <p key={i} className="text-muted mb-1">{detail}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card border-0 shadow-lg">
                <div className="card-header bg-primary text-white text-center">
                  <h3 className="mb-0">
                    <i className="bi bi-envelope me-2"></i>
                    أرسل لنا رسالة
                  </h3>
                </div>
                <div className="card-body p-5">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">الاسم الكامل *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="أدخل اسمك الكامل"
                        />
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">البريد الإلكتروني *</label>
                        <input
                          type="email"
                          className="form-control"
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
                        <label className="form-label fw-bold">رقم الهاتف</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="01xxxxxxxxx"
                        />
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">نوع الاستفسار *</label>
                        <select
                          className="form-select"
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          required
                        >
                          {departments.map(dept => (
                            <option key={dept.value} value={dept.value}>
                              {dept.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">موضوع الرسالة *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="موضوع مختصر للرسالة"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-bold">الرسالة *</label>
                      <textarea
                        className="form-control"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="5"
                        required
                        placeholder="اكتب رسالتك هنا..."
                      ></textarea>
                    </div>

                    <div className="text-center">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg px-5"
                        disabled={loading}
                      >
                        {loading ? (
                          <LoadingSpinner size="sm" text="جاري الإرسال..." />
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            إرسال الرسالة
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">الأسئلة الشائعة</h2>
            <p className="lead text-muted">إجابات على أكثر الأسئلة شيوعاً</p>
          </div>
          
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="accordion" id="faqAccordion">
                {faqs.map((faq, index) => (
                  <div key={index} className="accordion-item border-0 shadow-sm mb-3">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed fw-bold"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#faq${index}`}
                      >
                        {faq.question}
                      </button>
                    </h2>
                    <div
                      id={`faq${index}`}
                      className="accordion-collapse collapse"
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">موقعنا</h2>
            <p className="lead text-muted">تفضل بزيارتنا في مقرنا الرئيسي</p>
          </div>
          
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-0">
                  <div className="ratio ratio-21x9">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3454.1842094147!2d31.235712315436!3d30.04441998188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583fa60b21beeb%3A0x79dfb296e8423bba!2sTahrir%20Square%2C%20Cairo%20Governorate%2C%20Egypt!5e0!3m2!1sen!2seg!4v1635789012345!5m2!1sen!2seg"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="موقع GreenSwap Egypt"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-5">
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-4">تابعنا على وسائل التواصل</h2>
          <p className="lead text-muted mb-4">ابق على اطلاع بآخر الأخبار والتحديثات</p>
          
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <a href="#" className="btn btn-primary btn-lg">
              <i className="bi bi-facebook me-2"></i>
              Facebook
            </a>
            <a href="#" className="btn btn-info btn-lg">
              <i className="bi bi-twitter me-2"></i>
              Twitter
            </a>
            <a href="#" className="btn btn-danger btn-lg">
              <i className="bi bi-instagram me-2"></i>
              Instagram
            </a>
            <a href="#" className="btn btn-primary btn-lg">
              <i className="bi bi-linkedin me-2"></i>
              LinkedIn
            </a>
            <a href="#" className="btn btn-success btn-lg">
              <i className="bi bi-whatsapp me-2"></i>
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;