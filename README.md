# 🌱 GreenSwap Egypt - Backend

منصة رقمية متطورة لربط الأفراد والمؤسسات لإعادة تدوير المخلفات في مصر

## 🚀 الميزات الرئيسية

### 🔐 نظام المصادقة المتقدم
- JWT Authentication
- أنواع مستخدمين متعددة (فرد، مؤسسة، مركز إعادة تدوير)
- نظام التقييمات والملفات الشخصية
- إعدادات الخصوصية المتقدمة

### 📦 إدارة المنتجات
- إضافة وإدارة المنتجات مع صور متعددة
- نظام الفئات الهرمي
- البحث والفلترة المتقدمة
- نظام التقييمات والإعجابات
- تتبع المشاهدات والإحصائيات

### 🛒 نظام الطلبات
- إدارة كاملة للطلبات
- تتبع حالة الطلب
- نظام الرسائل المرتبطة بالطلبات
- تقييمات ما بعد البيع

### 💬 نظام المحادثات الفورية
- محادثات مباشرة بين المستخدمين
- WebSocket للتحديثات الفورية
- رفع الصور والملفات
- نظام الرد على الرسائل
- تتبع قراءة الرسائل

### 🔔 نظام الإشعارات المتقدم
- إشعارات فورية عبر WebSocket
- إشعارات البريد الإلكتروني
- إشعارات الرسائل النصية
- قوالب متعددة اللغات
- إعدادات مخصصة لكل مستخدم

### 🤖 خدمات الذكاء الاصطناعي
- تحليل الصور باستخدام GPT-4 Vision
- تحليل النصوص وتصنيف المحتوى
- اقتراح الأسعار الذكي
- مراجعة المحتوى تلقائياً
- البوت الذكي "جرين بوت"

## 🛠️ التقنيات المستخدمة

- **Django 5.0** - إطار العمل الرئيسي
- **Django REST Framework** - API
- **PostgreSQL** - قاعدة البيانات
- **Redis** - التخزين المؤقت والجلسات
- **Celery** - المهام في الخلفية
- **Channels** - WebSocket للتحديثات الفورية
- **OpenAI GPT-4** - الذكاء الاصطناعي
- **JWT** - المصادقة
- **Pillow** - معالجة الصور

## 📁 هيكل المشروع

```
greenswap_backend/
├── accounts/           # نظام المستخدمين والمصادقة
├── items/             # إدارة المنتجات والفئات
├── orders/            # نظام الطلبات
├── chat/              # نظام المحادثات
├── notifications/     # نظام الإشعارات
├── ai_services/       # خدمات الذكاء الاصطناعي
├── core/              # الوظائف الأساسية المشتركة
└── greenswap_backend/ # إعدادات المشروع
```

## 🔧 التثبيت والتشغيل

### 1. تثبيت المتطلبات
```bash
pip install -r requirements.txt
```

### 2. إعداد قاعدة البيانات
```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. إنشاء مستخدم إداري
```bash
python manage.py createsuperuser
```

### 4. تشغيل الخادم
```bash
python manage.py runserver
```

### 5. تشغيل Celery (في terminal منفصل)
```bash
celery -A greenswap_backend worker -l info
```

### 6. تشغيل Redis
```bash
redis-server
```

## 🌐 API Endpoints

### المصادقة
- `POST /api/auth/register/` - تسجيل مستخدم جديد
- `POST /api/auth/login/` - تسجيل الدخول
- `POST /api/auth/logout/` - تسجيل الخروج
- `GET /api/auth/current-user/` - المستخدم الحالي
- `PATCH /api/auth/profile/` - تحديث الملف الشخصي

### المنتجات
- `GET /api/items/` - قائمة المنتجات
- `POST /api/items/create/` - إضافة منتج جديد
- `GET /api/items/{id}/` - تفاصيل المنتج
- `GET /api/items/categories/` - قائمة الفئات
- `GET /api/items/featured/` - المنتجات المميزة

### الطلبات
- `GET /api/orders/` - قائمة الطلبات
- `POST /api/orders/create/` - إنشاء طلب جديد
- `GET /api/orders/my-orders/` - طلباتي
- `POST /api/orders/{id}/accept/` - قبول الطلب

### المحادثات
- `GET /api/chat/conversations/` - المحادثات
- `POST /api/chat/conversations/` - إنشاء محادثة
- `GET /api/chat/conversations/{id}/messages/` - رسائل المحادثة

### الإشعارات
- `GET /api/notifications/` - الإشعارات
- `POST /api/notifications/{id}/mark-read/` - تحديد كمقروء
- `GET /api/notifications/unread-count/` - عدد غير المقروءة

### الذكاء الاصطناعي
- `POST /api/ai/analyze-image/` - تحليل الصور
- `POST /api/ai/analyze-text/` - تحليل النصوص
- `POST /api/ai/suggest-price/` - اقتراح السعر
- `GET /api/ai/chatbot/sessions/` - جلسات البوت الذكي

## 🔒 الأمان

- مصادقة JWT آمنة
- تشفير كلمات المرور
- حماية من CSRF
- تحقق من صحة البيانات
- نظام أذونات متقدم
- تسجيل العمليات الحساسة

## 📊 الإحصائيات والتقارير

- إحصائيات المستخدمين والمنتجات
- تقارير المبيعات والطلبات
- إحصائيات الاستخدام
- تحليلات الأداء

## 🌍 دعم متعدد اللغات

- العربية (الافتراضية)
- الإنجليزية
- قوالب إشعارات متعددة اللغات

## 📱 WebSocket Events

### المحادثات
- `chat_message` - رسالة جديدة
- `typing_status` - حالة الكتابة
- `user_status` - حالة المستخدم
- `message_read` - قراءة الرسالة

### الإشعارات
- `notification` - إشعار جديد

## 🔄 المهام في الخلفية (Celery)

- معالجة الذكاء الاصطناعي
- إرسال الإشعارات
- تنظيف البيانات القديمة
- تحديث الإحصائيات

## 📝 المتغيرات البيئية

انسخ `.env.example` إلى `.env` وقم بتعديل القيم:

```env
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=greenswap_db
DB_USER=postgres
DB_PASSWORD=your-password
OPENAI_API_KEY=your-openai-key
EMAIL_HOST_USER=your-email
EMAIL_HOST_PASSWORD=your-email-password
```

## 🧪 الاختبارات

```bash
python manage.py test
```

## 📈 المراقبة والسجلات

- تسجيل العمليات في ملفات السجل
- مراقبة الأداء
- تتبع الأخطاء
- إحصائيات الاستخدام

## 🚀 النشر

### للتطوير

```bash
# إعداد قاعدة البيانات
python manage.py makemigrations
python manage.py migrate

# إنشاء مستخدم إداري
python manage.py createsuperuser

# تشغيل الخادم
python manage.py runserver
```

### للإنتاج

```bash
# إعداد متغيرات البيئة
cp .env.example .env

# تحديث الإعدادات
export DEBUG=False
export SECRET_KEY="your-production-key"

# إعداد قاعدة البيانات
python manage.py migrate
python manage.py collectstatic --noinput

# تشغيل مع Gunicorn
gunicorn greenswap_backend.wsgi:application --bind 0.0.0.0:8000
```

## 📞 الدعم

للدعم الفني أو الاستفسارات، يرجى التواصل معنا.

---

**GreenSwap Egypt** - نحو بيئة أنظف ومستقبل أفضل 🌱