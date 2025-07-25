# أوامر إدارة المشروع - GreenSwap Egypt

## 🚀 إعداد المشروع للإنتاج

### 1. إعداد قاعدة البيانات

```bash
# إنشاء migrations
python manage.py makemigrations

# تطبيق migrations
python manage.py migrate

# جمع الملفات الثابتة
python manage.py collectstatic --noinput
```

### 2. إنشاء مستخدم إداري

```bash
python manage.py createsuperuser
```

### 3. تشغيل الخادم

```bash
# للتطوير
python manage.py runserver

# للإنتاج مع Gunicorn
gunicorn greenswap_backend.wsgi:application --bind 0.0.0.0:8000

# مع إعدادات الإنتاج
gunicorn greenswap_backend.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 4 \
  --timeout 120 \
  --max-requests 1000 \
  --preload
```

### 4. إعداد Celery (للمهام في الخلفية)

```bash
# تشغيل Celery Worker
celery -A greenswap_backend worker -l info

# تشغيل Celery Beat (للمهام المجدولة)
celery -A greenswap_backend beat -l info

# مراقبة Celery
celery -A greenswap_backend flower
```

### 5. إعداد Redis (للتخزين المؤقت)

```bash
# تشغيل Redis
redis-server

# فحص حالة Redis
redis-cli ping
```

### 6. إعداد PostgreSQL (للإنتاج)

```sql
-- إنشاء قاعدة البيانات
CREATE DATABASE greenswap_db;

-- إنشاء مستخدم
CREATE USER greenswap_user WITH PASSWORD 'secure_password';

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON DATABASE greenswap_db TO greenswap_user;
```

### 7. متغيرات البيئة للإنتاج

```bash
# إنشاء ملف .env
cp .env.example .env

# تحديث المتغيرات
export SECRET_KEY="your-production-secret-key"
export DEBUG=False
export DATABASE_URL="postgresql://user:pass@localhost/dbname"
export REDIS_URL="redis://localhost:6379/0"
export OPENAI_API_KEY="your-openai-key"
```

### 8. إعداد Nginx (للإنتاج)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /static/ {
        alias /path/to/staticfiles/;
    }

    location /media/ {
        alias /path/to/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 9. إعداد SSL (للأمان)

```bash
# باستخدام Certbot
sudo certbot --nginx -d your-domain.com
```

### 10. مراقبة النظام

```bash
# فحص حالة الخدمات
systemctl status greenswap
systemctl status nginx
systemctl status postgresql
systemctl status redis

# مراقبة السجلات
tail -f /var/log/greenswap/django.log
```

## 🔒 أوامر الأمان

### تحديث كلمات المرور

```bash
python manage.py changepassword username
```

### نسخ احتياطية

```bash
# نسخة احتياطية من قاعدة البيانات
python manage.py dumpdata > backup.json

# استعادة النسخة الاحتياطية
python manage.py loaddata backup.json
```

### تنظيف البيانات

```bash
# تنظيف الجلسات المنتهية
python manage.py clearsessions

# تنظيف الملفات المؤقتة
python manage.py cleanup_temp_files
```

## 📊 أوامر التحليلات

### إحصائيات النظام

```bash
python manage.py generate_stats
python manage.py export_data --type=users --format=excel
```

## 🚀 نشر المشروع

### Docker

```bash
# بناء الصورة
docker build -t greenswap-backend .

# تشغيل الحاوية
docker run -p 8000:8000 greenswap-backend
```

### Docker Compose

```bash
# تشغيل جميع الخدمات
docker-compose up -d

# إيقاف الخدمات
docker-compose down
```

## ⚠️ ملاحظات مهمة

- تأكد من تحديث SECRET_KEY في الإنتاج
- استخدم قاعدة بيانات PostgreSQL في الإنتاج
- فعل HTTPS في الإنتاج
- راقب استخدام الموارد باستمرار
- احتفظ بنسخ احتياطية دورية