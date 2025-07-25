# from rest_framework import serializers
# from django.contrib.auth import authenticate
# from django.contrib.auth.password_validation import validate_password
# from django.core.exceptions import ValidationError
# from .models import User, UserProfile, UserRating

# class UserRegistrationSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True, validators=[validate_password])
#     password_confirm = serializers.CharField(write_only=True)

#     class Meta:
#         model = User
#         fields = ['email', 'password', 'password_confirm', 'full_name', 'user_type', 
#                  'phone', 'business_name', 'business_license', 'business_address', 'location']

#     def validate(self, attrs):
#         if attrs['password'] != attrs['password_confirm']:
#             raise serializers.ValidationError({'password_confirm': 'كلمتا المرور غير متطابقتين'})
#         return attrs

#     def create(self, validated_data):
#         validated_data.pop('password_confirm')
#         user = User.objects.create_user(**validated_data)
#         UserProfile.objects.create(user=user)
#         return user

# class UserLoginSerializer(serializers.Serializer):
#     email = serializers.EmailField()
#     password = serializers.CharField(write_only=True)

#     def validate(self, attrs):
#         email = attrs.get('email')
#         password = attrs.get('password')

#         if email and password:
#             user = authenticate(username=email, password=password)
#             if not user:
#                 raise serializers.ValidationError('بيانات تسجيل الدخول غير صحيحة')
#             if not user.is_active:
#                 raise serializers.ValidationError('حساب المستخدم غير نشط')
#             attrs['user'] = user
#         else:
#             raise serializers.ValidationError('البريد الإلكتروني وكلمة المرور مطلوبان')
        
#         return attrs

# class UserProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = UserProfile
#         fields = ['preferred_language', 'dark_mode', 'email_notifications', 
#                  'push_notifications', 'show_email', 'show_phone']

# class UserSerializer(serializers.ModelSerializer):
#     profile = UserProfileSerializer(read_only=True)
#     avatar_url = serializers.SerializerMethodField()

#     class Meta:
#         model = User
#         fields = ['id', 'email', 'full_name', 'user_type', 'phone', 'avatar', 'avatar_url', 
#                  'bio', 'location', 'business_name', 'business_license', 'business_address', 
#                  'is_verified', 'date_joined', 'total_items_posted', 'total_orders_made', 
#                  'rating_average', 'rating_count', 'profile']
#         read_only_fields = ['id', 'date_joined', 'total_items_posted', 'total_orders_made', 
#                            'rating_average', 'rating_count']

#     def get_avatar_url(self, obj):
#         if obj.avatar:
#             request = self.context.get('request')
#             if request:
#                 return request.build_absolute_uri(obj.avatar.url)
#             return obj.avatar.url
#         return None

# class UserUpdateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['full_name', 'phone', 'avatar', 'bio', 'location', 'business_name', 'business_address']

# class UserRatingSerializer(serializers.ModelSerializer):
#     rater_name = serializers.CharField(source='rater.full_name', read_only=True)
#     rater_avatar = serializers.SerializerMethodField()

#     class Meta:
#         model = UserRating
#         fields = ['id', 'rater', 'rater_name', 'rater_avatar', 'rating', 'comment', 'created_at']
#         read_only_fields = ['id', 'rater', 'created_at']

#     def get_rater_avatar(self, obj):
#         if obj.rater.avatar:
#             request = self.context.get('request')
#             if request:
#                 return request.build_absolute_uri(obj.rater.avatar.url)
#             return obj.rater.avatar.url
#         return None

# class UserPublicSerializer(serializers.ModelSerializer):
#     avatar_url = serializers.SerializerMethodField()

#     class Meta:
#         model = User
#         fields = ['id', 'full_name', 'user_type', 'avatar_url', 'bio', 'location', 
#                  'business_name', 'is_verified', 'date_joined', 'total_items_posted', 
#                  'rating_average', 'rating_count']

#     def get_avatar_url(self, obj):
#         if obj.avatar:
#             request = self.context.get('request')
#             if request:
#                 return request.build_absolute_uri(obj.avatar.url)
#             return obj.avatar.url
#         return None

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User, UserProfile, UserRating

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'full_name', 'user_type', 
                 'phone', 'business_name', 'business_license', 'business_address', 'location']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'كلمتا المرور غير متطابقتين'})
        
        # التحقق من البريد الإلكتروني
        email = attrs.get('email')
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({'email': 'هذا البريد الإلكتروني مستخدم بالفعل'})
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        try:
            user = User.objects.create_user(**validated_data)
            # الملف الشخصي سيتم إنشاؤه تلقائياً عبر الـ signal
            return user
        except Exception as e:
            raise serializers.ValidationError({'error': f'فشل في إنشاء الحساب: {str(e)}'})

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is inactive')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Email and password are required')
        
        return attrs

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['preferred_language', 'dark_mode', 'email_notifications', 
                 'push_notifications', 'show_email', 'show_phone']

class UserPublicSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'user_type', 'avatar_url', 'bio', 'location', 
                 'business_name', 'is_verified', 'date_joined', 'total_items_posted', 
                 'rating_average', 'rating_count']

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'user_type', 'phone', 'avatar', 'avatar_url', 
                 'bio', 'location', 'business_name', 'business_license', 'business_address', 
                 'is_verified', 'date_joined', 'total_items_posted', 'total_orders_made', 
                 'rating_average', 'rating_count', 'profile']
        read_only_fields = ['id', 'date_joined', 'total_items_posted', 'total_orders_made', 
                           'rating_average', 'rating_count']

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['full_name', 'phone', 'avatar', 'bio', 'location', 'business_name', 'business_address']

class UserRatingSerializer(serializers.ModelSerializer):
    rater_name = serializers.CharField(source='rater.full_name', read_only=True)
    rater_avatar = serializers.SerializerMethodField()

    class Meta:
        model = UserRating
        fields = ['id', 'rater', 'rater_name', 'rater_avatar', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'rater', 'created_at']

    def get_rater_avatar(self, obj):
        if obj.rater.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.rater.avatar.url)
            return obj.rater.avatar.url
        return None