from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from accounts.email_verf import send_verification_email , send_reset_email
from .models import User, UserProfile, UserRating
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer, 
    UserUpdateSerializer, UserRatingSerializer, UserPublicSerializer,
    UserProfileSerializer
)

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        print("==== Incoming Registration Data ====")
        print("DATA:", request.data)
        print("FILES:", request.FILES)
        print("QUERY PARAMS:", request.query_params)
        print("USER:", request.user)
        print("===============================")
        token=send_verification_email(request.data.get('email'))
        request.data['token'] = token
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'تم تسجيل الحساب بنجاح'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print("Error during user registration:", e)
            return Response(
                {'error': 's'},
                status=status.HTTP_409_CONFLICT)

            
            


class ResetPassword(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        print(request.data)
        email = request.data.get('email')
        if not email:
            return Response({'detail': 'البريد الإلكتروني مطلوب'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            token = send_reset_email(email)
            user.token = token
            user.is_forgot_password = True
            user.save()
            return Response({'detail': 'تم إرسال رمز التحقق إلى بريدك الإلكتروني'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'detail': 'هذا البريد الإلكتروني غير مسجل'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request):
        print(request.data)

        email = request.data.get('email')
        token = request.data.get('token')
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')

        if not email or not token or not password or not confirm_password:
            return Response({'detail': 'جميع الحقول مطلوبة'}, status=status.HTTP_400_BAD_REQUEST)

        if password != confirm_password:
            return Response({'detail': 'كلمتا المرور غير متطابقتين'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            if user.token != token or not user.is_forgot_password:
                return Response({'detail': 'رمز غير صالح أو انتهت صلاحيته'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(password)
            user.is_forgot_password = False
            user.token = None  # Clear token after use
            user.save()
            return Response({'detail': 'تم إعادة تعيين كلمة المرور بنجاح'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'detail': 'المستخدم غير موجود'}, status=status.HTTP_404_NOT_FOUND)
        

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'البريد الإلكتروني مطلوب'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
        token = send_reset_email(email)
        user.token = token
        user.is_forgot_password = True
        user.save()
        return Response({'message': 'تم إرسال رمز التحقق إلى بريدك الإلكتروني'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'هذا البريد الإلكتروني غير مسجل'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verf(request):
    print(request.POST) #out <rest_framework.request.Request: POST '/api/auth/verf/'>
    token = request.data.get('token')  # Get token from JSON body
    if not token:
        return Response({'error': 'رمز التحقق غير موجود'}, status=status.HTTP_408_REQUEST_TIMEOUT)

    try:
        user = User.objects.get(token=token)
        user.is_verified = True
        user.token = None  # Clear the token after verification
        user.save()
        return Response({'message': 'تم التحقق من الحساب بنجاح'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'رمز التحقق غير صالح أو منتهي الصلاحية'}, status=status.HTTP_409_CONFLICT)
    
class UserLoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'تم تسجيل الدخول بنجاح'
        })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'تم تسجيل الخروج بنجاح'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'حدث خطأ أثناء تسجيل الخروج'}, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserProfileUpdateView(generics.UpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserProfileSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

class UserPublicProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserPublicSerializer
    permission_classes = [permissions.AllowAny]

class UserRatingListCreateView(generics.ListCreateAPIView):
    serializer_class = UserRatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return UserRating.objects.filter(rated_user_id=user_id)

    def perform_create(self, serializer):
        user_id = self.kwargs.get('user_id')
        rated_user = User.objects.get(id=user_id)
        
        if rated_user == self.request.user:
            raise serializers.ValidationError('لا يمكنك تقييم نفسك')
        
        serializer.save(rater=self.request.user, rated_user=rated_user)
        rated_user.update_rating()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    user = request.user
    return Response({
        'total_items_posted': user.total_items_posted,
        'total_orders_made': user.total_orders_made,
        'rating_average': user.rating_average,
        'rating_count': user.rating_count,
        'member_since': user.date_joined.strftime('%Y-%m-%d'),
        'is_verified': user.is_verified
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    user = request.user
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not user.check_password(current_password):
        return Response({'error': 'كلمة المرور الحالية غير صحيحة'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        from django.contrib.auth.password_validation import validate_password
        validate_password(new_password)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'تم تغيير كلمة المرور بنجاح'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)