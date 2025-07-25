from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

# class UserManager(BaseUserManager):
#     def create_user(self, email, password=None, **extra_fields):
#         if not email:
#             raise ValueError(_('البريد الإلكتروني مطلوب'))
        
#         email = self.normalize_email(email)
#         user = self.model(email=email, **extra_fields)
#         user.set_password(password)
#         # user.is_superuser = extra_fields.get('is_superuser', False)
#         # user.is_staff = extra_fields.get('is_staff', False)
#         # user.is_active = extra_fields.get('is_active', True)
#         user.save(using=self._db)
#         return user

#     def create_superuser(self, email, password=None, **extra_fields):
#         extra_fields.setdefault('is_staff', True)
#         extra_fields.setdefault('is_superuser', True)
#         extra_fields.setdefault('is_active', True)

#         if extra_fields.get('is_staff') is not True:
#             raise ValueError(_('المدير يجب أن يكون لديه is_staff=True'))
#         if extra_fields.get('is_superuser') is not True:
#             raise ValueError(_('المدير يجب أن يكون لديه is_superuser=True'))

#         return self.create_user(email, password, **extra_fields)

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('البريد الإلكتروني مطلوب')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('المدير يجب أن يكون لديه is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('المدير يجب أن يكون لديه is_superuser=True')

        return self.create_user(email, password, **extra_fields)
    
class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPES = (
        ('individual', 'فرد'),
        ('business', 'مؤسسة'),
        ('recycling_center', 'مركز إعادة تدوير'),
    )

    email = models.EmailField(_('البريد الإلكتروني'), unique=True)
    phone = models.CharField(_('رقم الهاتف'), max_length=15, blank=True)
    full_name = models.CharField(_('الاسم الكامل'), max_length=100)
    user_type = models.CharField(_('نوع المستخدم'), max_length=20, choices=USER_TYPES, default='individual')
    
    # Profile Information
    avatar = models.ImageField(_('الصورة الشخصية'), upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(_('نبذة شخصية'), max_length=500, blank=True)
    location = models.CharField(_('الموقع'), max_length=100, blank=True)
    
    # Business Information (for business users)
    business_name = models.CharField(_('اسم المؤسسة'), max_length=200, blank=True)
    business_license = models.CharField(_('رقم الترخيص'), max_length=100, blank=True)
    business_address = models.TextField(_('عنوان المؤسسة'), blank=True)
    
    # Account Status
    is_active = models.BooleanField(_('نشط'), default=True)
    is_staff = models.BooleanField(_('موظف'), default=False)
    is_verified = models.BooleanField(_('موثق'), default=False)
    
    # Dates
    date_joined = models.DateTimeField(_('تاريخ التسجيل'), default=timezone.now)
    last_login = models.DateTimeField(_('آخر دخول'), null=True, blank=True)
    
    # Statistics
    total_items_posted = models.IntegerField(_('إجمالي المنتجات المنشورة'), default=0)
    total_orders_made = models.IntegerField(_('إجمالي الطلبات المقدمة'), default=0)
    rating_average = models.FloatField(_('متوسط التقييم'), default=0.0)
    rating_count = models.IntegerField(_('عدد التقييمات'), default=0)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = _('مستخدم')
        verbose_name_plural = _('المستخدمون')

    def __str__(self):
        return self.email

    def get_full_name(self):
        return self.full_name

    def get_short_name(self):
        return self.full_name.split()[0] if self.full_name else self.email

    def update_rating(self):
        from .ratings import UserRating
        ratings = UserRating.objects.filter(rated_user=self)
        if ratings.exists():
            self.rating_average = ratings.aggregate(models.Avg('rating'))['rating__avg'] or 0
            self.rating_count = ratings.count()
            self.save()

class UserRating(models.Model):
    rater = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_ratings', verbose_name=_('المقيم'))
    rated_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_ratings', verbose_name=_('المستخدم المقيم'))
    rating = models.IntegerField(_('التقييم'), choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(_('التعليق'), blank=True)
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)

    class Meta:
        unique_together = ['rater', 'rated_user']
        verbose_name = _('تقييم المستخدم')
        verbose_name_plural = _('تقييمات المستخدمين')

    def __str__(self):
        return f'{self.rater} rated {self.rated_user} - {self.rating} stars'

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    preferred_language = models.CharField(_('اللغة المفضلة'), max_length=10, choices=[('ar', 'العربية'), ('en', 'English')], default='ar')
    dark_mode = models.BooleanField(_('الوضع المظلم'), default=False)
    email_notifications = models.BooleanField(_('إشعارات البريد الإلكتروني'), default=True)
    push_notifications = models.BooleanField(_('الإشعارات المباشرة'), default=True)
    
    # Privacy Settings
    show_email = models.BooleanField(_('إظهار البريد الإلكتروني'), default=False)
    show_phone = models.BooleanField(_('إظهار رقم الهاتف'), default=False)
    
    created_at = models.DateTimeField(_('تاريخ الإنشاء'), auto_now_add=True)
    updated_at = models.DateTimeField(_('تاريخ التحديث'), auto_now=True)

    class Meta:
        verbose_name = _('ملف المستخدم')
        verbose_name_plural = _('ملفات المستخدمين')

    def __str__(self):
        return f'Profile of {self.user.full_name}'