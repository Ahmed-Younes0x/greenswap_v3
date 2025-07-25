import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Help = () => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchTerm, setSearchTerm] = useState('');

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'البدء',
      icon: 'play-circle',
      color: 'primary'
    },
    {
      id: 'selling',
      title: 'البيع',
      icon: 'shop',
      color: 'success'
    },
    {
      id: 'buying',
      title: 'الشراء',
      icon: 'cart',
      color: 'info'
    },
    {
      id: 'ai-features',
      title: 'الذكاء الاصطناعي',
      icon: 'robot',
      color: 'warning'
    },
    {
      id: 'account',
      title: 'الحساب',
      icon: 'person-circle',
      color: 'secondary'
    },
    {
      id: 'troubleshooting',
      title: 'حل المشاكل',
      icon: 'tools',
      color: 'danger'
    }
  ];

  const helpContent = {
    'getting-started': [
      {
        question: 'كيف أبدأ في استخدام GreenSwap؟',
        answer: 'ابدأ بإنشاء حساب مجاني، ثم اختر نوع المستخدم (فرد، شركة، أو مركز تدوير). بعدها يمكنك إضافة منتجاتك أو تصفح المنتجات المتاحة.',
        steps: [
          'اذهب إلى صفحة التسجيل',
          'اختر نوع الحساب المناسب',
          'املأ البيانات المطلوبة',
          'تحقق من بريدك الإلكتروني',
          'ابدأ في استخدام المنصة'
        ]
      },
      {
        question: 'ما هي أنواع الحسابات المتاحة؟',
        answer: 'نوفر ثلاثة أنواع من الحسابات: الأفراد للاستخدام الشخصي، الشركات للمؤسسات التجارية، ومراكز التدوير للمتخصصين في إعادة التدوير.',
        steps: []
      },
      {
        question: 'هل الخدمة مجانية؟',
        answer: 'نعم، التسجيل والاستخدام الأساسي مجاني تماماً. نحصل على عمولة صغيرة فقط عند إتمام عمليات البيع الناجحة.',
        steps: []
      }
    ],
    'selling': [
      {
        question: 'كيف أضيف منتج للبيع؟',
        answer: 'اذهب إلى "إضافة منتج" واملأ البيانات المطلوبة مع رفع صور واضحة. يمكنك استخدام التصنيف الذكي لتحديد الفئة والسعر المناسب.',
        steps: [
          'اضغط على "إضافة منتج"',
          'املأ عنوان ووصف المنتج',
          'ارفع صور واضحة وعالية الجودة',
          'استخدم التصنيف الذكي',
          'حدد السعر والكمية',
          'انشر المنتج'
        ]
      },
      {
        question: 'كيف أستخدم التصنيف الذكي؟',
        answer: 'ارفع صورة واضحة للمخلف وسيقوم الذكاء الاصطناعي بتحليلها وتصنيفها تلقائياً مع اقتراح السعر المناسب والفئة.',
        steps: [
          'اذهب إلى صفحة التصنيف الذكي',
          'ارفع صورة واضحة للمخلف',
          'انتظر نتائج التحليل',
          'راجع التصنيف والسعر المقترح',
          'استخدم النتائج في إضافة المنتج'
        ]
      },
      {
        question: 'كيف أحدد السعر المناسب؟',
        answer: 'يمكنك استخدام اقتراح السعر الذكي، أو مراجعة أسعار المنتجات المشابهة، أو الاستعانة بخبراء المنصة.',
        steps: []
      }
    ],
    'buying': [
      {
        question: 'كيف أطلب منتج؟',
        answer: 'تصفح المنتجات، اختر ما يناسبك، واضغط "طلب المنتج". املأ بيانات التسليم وانتظر موافقة البائع.',
        steps: [
          'تصفح المنتجات أو ابحث عما تريد',
          'اضغط على المنتج لعرض التفاصيل',
          'اضغط "طلب المنتج"',
          'املأ بيانات التسليم',
          'أرسل الطلب وانتظر الموافقة'
        ]
      },
      {
        question: 'كيف أتواصل مع البائع؟',
        answer: 'يمكنك بدء محادثة مباشرة مع البائع من صفحة المنتج أو من خلال صفحة الطلب.',
        steps: []
      },
      {
        question: 'كيف أتتبع طلبي؟',
        answer: 'اذهب إلى "طلباتي" لمتابعة حالة جميع طلباتك ومراسلة البائعين.',
        steps: []
      }
    ],
    'ai-features': [
      {
        question: 'ما هو التصنيف الذكي؟',
        answer: 'تقنية ذكاء اصطناعي متقدمة تحلل صور المخلفات وتصنفها تلقائياً مع تقدير القيمة والأثر البيئي.',
        steps: []
      },
      {
        question: 'كيف يعمل البوت الذكي؟',
        answer: 'مساعد ذكي متخصص في إعادة التدوير يجيب على أسئلتك ويقدم نصائح مخصصة.',
        steps: []
      },
      {
        question: 'ما دقة التصنيف الذكي؟',
        answer: 'تصل دقة نظامنا إلى 95% في تصنيف المخلفات الشائعة، ونحسن النظام باستمرار.',
        steps: []
      }
    ],
    'account': [
      {
        question: 'كيف أحدث بياناتي الشخصية؟',
        answer: 'اذهب إلى "الملف الشخصي" وقم بتحديث المعلومات المطلوبة.',
        steps: [
          'اذهب إلى الملف الشخصي',
          'اضغط على "تعديل"',
          'حدث البيانات المطلوبة',
          'احفظ التغييرات'
        ]
      },
      {
        question: 'كيف أغير كلمة المرور؟',
        answer: 'من الملف الشخصي، اختر "تغيير كلمة المرور" وادخل كلمة المرور الحالية والجديدة.',
        steps: []
      },
      {
        question: 'كيف أحذف حسابي؟',
        answer: 'تواصل مع فريق الدعم لحذف حسابك نهائياً. سيتم حذف جميع بياناتك خلال 30 يوم.',
        steps: []
      }
    ],
    'troubleshooting': [
      {
        question: 'لا أستطيع تسجيل الدخول',
        answer: 'تأكد من صحة البريد الإلكتروني وكلمة المرور. إذا نسيت كلمة المرور، استخدم "نسيت كلمة المرور".',
        steps: [
          'تحقق من البريد الإلكتروني',
          'تأكد من كلمة المرور',
          'استخدم "نسيت كلمة المرور" إذا لزم الأمر',
          'تحقق من بريدك الإلكتروني',
          'تواصل مع الدعم إذا استمرت المشكلة'
        ]
      },
      {
        question: 'التصنيف الذكي لا يعمل',
        answer: 'تأكد من جودة الصورة ووضوحها. الصور الضبابية أو المظلمة قد تؤثر على دقة التصنيف.',
        steps: []
      },
      {
        question: 'لا أتلقى إشعارات',
        answer: 'تحقق من إعدادات الإشعارات في حسابك وتأكد من تفعيل الإشعارات في متصفحك.',
        steps: []
      }
    ]
  };

  const filteredContent = helpContent[activeCategory]?.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">مركز المساعدة</h1>
        <p className="lead text-muted">نحن هنا لمساعدتك في كل خطوة</p>
      </div>

      {/* Search */}
      <div className="row justify-content-center mb-5">
        <div className="col-lg-6">
          <div className="input-group input-group-lg">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="ابحث في مركز المساعدة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: '100px' }}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-list me-2"></i>
                الفئات
              </h5>
            </div>
            <div className="list-group list-group-flush">
              {helpCategories.map(category => (
                <button
                  key={category.id}
                  className={`list-group-item list-group-item-action ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <i className={`bi bi-${category.icon} me-2 text-${category.color}`}></i>
                  {category.title}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-header bg-light">
              <h6 className="mb-0 fw-bold">روابط سريعة</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/ai-classify" className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-robot me-2"></i>
                  التصنيف الذكي
                </Link>
                <Link to="/ai-chat" className="btn btn-outline-success btn-sm">
                  <i className="bi bi-chat-dots me-2"></i>
                  البوت الذكي
                </Link>
                <Link to="/contact" className="btn btn-outline-info btn-sm">
                  <i className="bi bi-envelope me-2"></i>
                  تواصل معنا
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="col-lg-9">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light">
              <h4 className="mb-0 fw-bold">
                <i className={`bi bi-${helpCategories.find(c => c.id === activeCategory)?.icon} me-2`}></i>
                {helpCategories.find(c => c.id === activeCategory)?.title}
              </h4>
            </div>
            <div className="card-body">
              {filteredContent.length > 0 ? (
                <div className="accordion" id="helpAccordion">
                  {filteredContent.map((item, index) => (
                    <div key={index} className="accordion-item border-0 shadow-sm mb-3">
                      <h2 className="accordion-header">
                        <button
                          className="accordion-button collapsed fw-bold"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#help${index}`}
                        >
                          <i className="bi bi-question-circle me-2 text-primary"></i>
                          {item.question}
                        </button>
                      </h2>
                      <div
                        id={`help${index}`}
                        className="accordion-collapse collapse"
                        data-bs-parent="#helpAccordion"
                      >
                        <div className="accordion-body">
                          <p className="mb-3">{item.answer}</p>
                          
                          {item.steps && item.steps.length > 0 && (
                            <div>
                              <h6 className="fw-bold mb-2">الخطوات:</h6>
                              <ol className="list-group list-group-numbered">
                                {item.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="list-group-item border-0 bg-light">
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-search text-muted" style={{ fontSize: '4rem' }}></i>
                  <h5 className="mt-3 text-muted">لا توجد نتائج</h5>
                  <p className="text-muted">جرب البحث بكلمات مختلفة أو اختر فئة أخرى</p>
                </div>
              )}
            </div>
          </div>

          {/* Still Need Help */}
          <div className="card border-0 bg-primary text-white mt-4">
            <div className="card-body text-center p-4">
              <h5 className="fw-bold mb-3">لا تزال تحتاج مساعدة؟</h5>
              <p className="mb-3">فريق الدعم جاهز لمساعدتك على مدار الساعة</p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link to="/contact" className="btn btn-light">
                  <i className="bi bi-envelope me-2"></i>
                  تواصل معنا
                </Link>
                <Link to="/ai-chat" className="btn btn-outline-light">
                  <i className="bi bi-robot me-2"></i>
                  البوت الذكي
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Articles */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">المقالات الأكثر شيوعاً</h2>
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-play-circle text-primary fs-5"></i>
                    </div>
                    <h6 className="mb-0 fw-bold">دليل البداية السريع</h6>
                  </div>
                  <p className="text-muted small">تعلم كيفية استخدام المنصة في 5 دقائق</p>
                  <Link to="#" className="btn btn-outline-primary btn-sm">
                    اقرأ المزيد
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-robot text-success fs-5"></i>
                    </div>
                    <h6 className="mb-0 fw-bold">استخدام الذكاء الاصطناعي</h6>
                  </div>
                  <p className="text-muted small">دليل شامل لاستخدام ميزات AI</p>
                  <Link to="#" className="btn btn-outline-success btn-sm">
                    اقرأ المزيد
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                      <i className="bi bi-shield-check text-info fs-5"></i>
                    </div>
                    <h6 className="mb-0 fw-bold">نصائح الأمان</h6>
                  </div>
                  <p className="text-muted small">كيف تحمي نفسك أثناء التعامل</p>
                  <Link to="#" className="btn btn-outline-info btn-sm">
                    اقرأ المزيد
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Help;