import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  const teamMembers = [
    {
      name: 'أحمد محمد',
      role: 'المؤسس والرئيس التنفيذي',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'خبير في التكنولوجيا البيئية مع أكثر من 10 سنوات من الخبرة',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'فاطمة أحمد',
      role: 'مديرة التطوير',
      image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'مطورة برمجيات متخصصة في تطبيقات الويب والذكاء الاصطناعي',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'محمد علي',
      role: 'مدير العمليات',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'خبير في إدارة العمليات وتحسين الأداء التشغيلي',
      linkedin: '#',
      twitter: '#'
    },
    {
      name: 'سارة حسن',
      role: 'مديرة التسويق',
      image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'متخصصة في التسويق الرقمي والتواصل مع المجتمع',
      linkedin: '#',
      twitter: '#'
    }
  ];

  const milestones = [
    {
      year: '2023',
      title: 'تأسيس الشركة',
      description: 'بداية الرحلة مع فكرة تحويل المخلفات إلى ثروة'
    },
    {
      year: '2024',
      title: 'إطلاق المنصة',
      description: 'إطلاق النسخة الأولى من منصة GreenSwap Egypt'
    },
    {
      year: '2024',
      title: 'الذكاء الاصطناعي',
      description: 'إضافة تقنيات الذكاء الاصطناعي للتصنيف التلقائي'
    },
    {
      year: '2024',
      title: 'التوسع',
      description: 'خطط التوسع لتغطية جميع محافظات مصر'
    }
  ];

  const values = [
    {
      icon: 'leaf',
      title: 'الاستدامة البيئية',
      description: 'نؤمن بأهمية الحفاظ على البيئة للأجيال القادمة'
    },
    {
      icon: 'people',
      title: 'المسؤولية المجتمعية',
      description: 'نسعى لخلق تأثير إيجابي في المجتمع المصري'
    },
    {
      icon: 'lightbulb',
      title: 'الابتكار',
      description: 'نستخدم أحدث التقنيات لحل المشاكل البيئية'
    },
    {
      icon: 'shield-check',
      title: 'الشفافية',
      description: 'نلتزم بالشفافية في جميع تعاملاتنا'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">من نحن</h1>
              <p className="lead mb-4">
                نحن فريق من المتخصصين المتحمسين لحماية البيئة وتحويل المخلفات إلى فرص اقتصادية مستدامة
              </p>
              <Link to="/auth" className="btn btn-light btn-lg">
                <i className="bi bi-rocket-takeoff me-2"></i>
                انضم إلينا
              </Link>
            </div>
            <div className="col-lg-6 text-center">
              <img
                src="https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="فريق العمل"
                className="img-fluid rounded shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-5 text-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-bullseye text-primary" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                  <h3 className="fw-bold mb-3">رسالتنا</h3>
                  <p className="text-muted">
                    تمكين الأفراد والمؤسسات في مصر من تحويل مخلفاتهم إلى مصادر دخل مستدامة، 
                    مع المساهمة في حماية البيئة وبناء اقتصاد دائري أخضر.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-6 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-5 text-center">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-eye text-success" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                  <h3 className="fw-bold mb-3">رؤيتنا</h3>
                  <p className="text-muted">
                    أن نصبح المنصة الرائدة في الشرق الأوسط لإعادة تدوير المخلفات، 
                    ونساهم في تحقيق أهداف التنمية المستدامة 2030.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">قيمنا</h2>
            <p className="lead text-muted">المبادئ التي نؤمن بها ونعمل من خلالها</p>
          </div>
          
          <div className="row">
            {values.map((value, index) => (
              <div key={index} className="col-lg-3 col-md-6 mb-4">
                <div className="card border-0 shadow-sm h-100 text-center">
                  <div className="card-body p-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{ width: '60px', height: '60px' }}>
                      <i className={`bi bi-${value.icon} text-primary fs-4`}></i>
                    </div>
                    <h5 className="fw-bold mb-3">{value.title}</h5>
                    <p className="text-muted">{value.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">رحلتنا</h2>
            <p className="lead text-muted">المحطات المهمة في تطوير المنصة</p>
          </div>
          
          <div className="row">
            {milestones.map((milestone, index) => (
              <div key={index} className="col-lg-3 col-md-6 mb-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{ width: '60px', height: '60px' }}>
                      <h5 className="mb-0 fw-bold">{milestone.year}</h5>
                    </div>
                    <h5 className="fw-bold mb-3">{milestone.title}</h5>
                    <p className="text-muted">{milestone.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">فريق العمل</h2>
            <p className="lead text-muted">الأشخاص الذين يقودون رؤيتنا نحو مستقبل أخضر</p>
          </div>
          
          <div className="row">
            {teamMembers.map((member, index) => (
              <div key={index} className="col-lg-3 col-md-6 mb-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="rounded-circle mb-3"
                      width="120"
                      height="120"
                      style={{ objectFit: 'cover' }}
                    />
                    <h5 className="fw-bold mb-1">{member.name}</h5>
                    <p className="text-primary fw-semibold mb-3">{member.role}</p>
                    <p className="text-muted small mb-3">{member.bio}</p>
                    <div className="d-flex justify-content-center gap-2">
                      <a href={member.linkedin} className="btn btn-outline-primary btn-sm">
                        <i className="bi bi-linkedin"></i>
                      </a>
                      <a href={member.twitter} className="btn btn-outline-info btn-sm">
                        <i className="bi bi-twitter"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card border-0 bg-primary text-white">
                <div className="card-body">
                  <i className="bi bi-people" style={{ fontSize: '3rem' }}></i>
                  <h3 className="mt-3 mb-1">10,000+</h3>
                  <p className="mb-0">مستخدم نشط</p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card border-0 bg-success text-white">
                <div className="card-body">
                  <i className="bi bi-recycle" style={{ fontSize: '3rem' }}></i>
                  <h3 className="mt-3 mb-1">50,000+</h3>
                  <p className="mb-0">طن معاد تدويره</p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card border-0 bg-info text-white">
                <div className="card-body">
                  <i className="bi bi-building" style={{ fontSize: '3rem' }}></i>
                  <h3 className="mt-3 mb-1">500+</h3>
                  <p className="mb-0">شركة شريكة</p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card border-0 bg-warning text-white">
                <div className="card-body">
                  <i className="bi bi-geo-alt" style={{ fontSize: '3rem' }}></i>
                  <h3 className="mt-3 mb-1">27</h3>
                  <p className="mb-0">محافظة مغطاة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5 bg-primary text-white">
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="display-5 fw-bold mb-4">انضم إلى رحلتنا</h2>
              <p className="lead mb-4">
                كن جزءاً من التغيير الإيجابي وساهم في بناء مستقبل أخضر ومستدام لمصر
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link to="/auth" className="btn btn-light btn-lg">
                  <i className="bi bi-person-plus me-2"></i>
                  إنشاء حساب
                </Link>
                <Link to="/contact" className="btn btn-outline-light btn-lg">
                  <i className="bi bi-envelope me-2"></i>
                  تواصل معنا
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;