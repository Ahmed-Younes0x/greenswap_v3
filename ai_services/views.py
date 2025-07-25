from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
import uuid
from .models import AIAnalysis, ChatBot, ChatBotMessage, AIModel
from .serializers import (
    AIAnalysisSerializer, AIAnalysisCreateSerializer, ChatBotSerializer,
    ChatBotCreateSerializer, ChatBotMessageSerializer, ChatBotMessageCreateSerializer,
    AIModelSerializer, AIStatsSerializer
)
from .services import AIService

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def classify_waste_image(request):
    """تصنيف المخلفات من الصورة باستخدام الذكاء الاصطناعي"""
    
    if 'image' not in request.FILES:
        return Response({'error': 'الصورة مطلوبة'}, status=status.HTTP_400_BAD_REQUEST)
    
    image = request.FILES['image']
    
    # التحقق من نوع الملف
    allowed_types = ['image/jpeg', 'image/png', 'image/webp']
    if image.content_type not in allowed_types:
        return Response({'error': 'نوع الملف غير مدعوم'}, status=status.HTTP_400_BAD_REQUEST)
    
    # التحقق من حجم الملف (5MB كحد أقصى)
    if image.size > 5 * 1024 * 1024:
        return Response({'error': 'حجم الملف كبير جداً'}, status=status.HTTP_400_BAD_REQUEST)
    
    # إنشاء تحليل جديد
    analysis = AIAnalysis.objects.create(
        user=request.user,
        analysis_type='image_classification',
        input_image=image
    )
    
    try:
        # تحليل الصورة باستخدام الذكاء الاصطناعي
        result = AIService.classify_waste_image(analysis)
        
        return Response({
            'analysis_id': analysis.id,
            'classification': result,
            'message': 'تم تصنيف المخلف بنجاح'
        })
        
    except Exception as e:
        analysis.fail_processing(str(e))
        return Response({
            'error': 'فشل في تصنيف المخلف',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class AIAnalysisListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AIAnalysisCreateSerializer
        return AIAnalysisSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = AIAnalysis.objects.filter(user=user)
        
        # فلترة حسب النوع
        analysis_type = self.request.query_params.get('type')
        if analysis_type:
            queryset = queryset.filter(analysis_type=analysis_type)
        
        # فلترة حسب الحالة
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        analysis = serializer.save(user=self.request.user)
        
        # بدء المعالجة في الخلفية
        from .tasks import process_ai_analysis
        process_ai_analysis.delay(analysis.id)

class AIAnalysisDetailView(generics.RetrieveAPIView):
    serializer_class = AIAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return AIAnalysis.objects.filter(user=self.request.user)

class ChatBotSessionListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChatBotCreateSerializer
        return ChatBotSerializer  # Read serializer that includes session_id
    
    def get_queryset(self):
        return ChatBot.objects.filter(user=self.request.user, is_active=True)
    
    def perform_create(self, serializer):
        session_id = str(uuid.uuid4())
        instance = serializer.save(user=self.request.user, session_id=session_id)
        # After saving, serialize it using the read serializer and return full response
        read_serializer = ChatBotSerializer(instance, context={'request': self.request})
        self.response_data = read_serializer.data

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response(self.response_data, status=status.HTTP_201_CREATED)
class ChatBotSessionDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ChatBotSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ChatBot.objects.filter(user=self.request.user)

class ChatBotMessageListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChatBotMessageCreateSerializer
        return ChatBotMessageSerializer

    def get_queryset(self):
        session_id = self.kwargs.get('session_id')
        return ChatBotMessage.objects.filter(
            session__session_id=session_id,
            session__user=self.request.user
        ).order_by('created_at')

    def perform_create(self, serializer):
        session_id = self.kwargs.get('session_id')
        session = get_object_or_404(ChatBot, session_id=session_id, user=self.request.user)

        # Save user message
        user_message = serializer.save(
            session=session,
            message_type='user'
        )

        # Process and save bot response
        bot_response = AIService.process_chatbot_message(session, user_message.content)
        print('line 41, bot response:', bot_response)

        self.bot_message = ChatBotMessage.objects.create(
            session=session,
            message_type='bot',
            content=bot_response['content'],
            metadata=bot_response.get('metadata', {}),
            processing_time=bot_response.get('processing_time')
        )

        # Update session
        session.last_activity = timezone.now()
        session.save()

        self.user_message = user_message  # store for access in create()

    def create(self, request, *args, **kwargs):
        print("line 55, entering create")
        super().create(request, *args, **kwargs)

        user_data = ChatBotMessageSerializer(self.user_message).data
        bot_data = ChatBotMessageSerializer(self.bot_message).data

        print("line 59, response user:", user_data)
        print("line 60, response bot:", bot_data)

        return Response({
            "user": user_data,
            "bot": bot_data
        }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def analyze_image(request):
    """تحليل صورة باستخدام الذكاء الاصطناعي"""
    
    if 'image' not in request.FILES:
        return Response({'error': 'الصورة مطلوبة'}, status=status.HTTP_400_BAD_REQUEST)
    
    image = request.FILES['image']
    analysis_type = request.data.get('analysis_type', 'image_classification')
    
    # إنشاء تحليل جديد
    analysis = AIAnalysis.objects.create(
        user=request.user,
        analysis_type=analysis_type,
        input_image=image
    )
    
    # معالجة الصورة
    try:
        result = AIService.analyze_image(analysis)
        return Response({
            'analysis_id': analysis.id,
            'result': result,
            'message': 'تم تحليل الصورة بنجاح'
        })
    except Exception as e:
        analysis.fail_processing(str(e))
        return Response({'error': 'فشل في تحليل الصورة'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def analyze_text(request):
    """تحليل نص باستخدام الذكاء الاصطناعي"""
    
    text = request.data.get('text')
    if not text:
        return Response({'error': 'النص مطلوب'}, status=status.HTTP_400_BAD_REQUEST)
    
    analysis_type = request.data.get('analysis_type', 'text_analysis')
    
    # إنشاء تحليل جديد
    analysis = AIAnalysis.objects.create(
        user=request.user,
        analysis_type=analysis_type,
        input_text=text
    )
    
    # معالجة النص
    try:
        result = AIService.analyze_text(analysis)
        return Response({
            'analysis_id': analysis.id,
            'result': result,
            'message': 'تم تحليل النص بنجاح'
        })
    except Exception as e:
        analysis.fail_processing(str(e))
        return Response({'error': 'فشل في تحليل النص'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def suggest_price(request):
    """اقتراح سعر للمنتج"""
    
    item_data = request.data
    required_fields = ['title', 'description', 'category', 'condition']
    
    for field in required_fields:
        if field not in item_data:
            return Response({'error': f'{field} مطلوب'}, status=status.HTTP_400_BAD_REQUEST)
    
    # إنشاء تحليل جديد
    analysis = AIAnalysis.objects.create(
        user=request.user,
        analysis_type='price_suggestion',
        input_data=item_data
    )
    
    try:
        result = AIService.suggest_price(analysis)
        return Response({
            'analysis_id': analysis.id,
            'suggested_price': result['suggested_price'],
            'price_range': result['price_range'],
            'confidence': result['confidence'],
            'factors': result['factors'],
            'message': 'تم اقتراح السعر بنجاح'
        })
    except Exception as e:
        analysis.fail_processing(str(e))
        return Response({'error': 'فشل في اقتراح السعر'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def moderate_content(request):
    """مراجعة المحتوى"""
    
    content = request.data.get('content')
    content_type = request.data.get('content_type', 'text')
    
    if not content:
        return Response({'error': 'المحتوى مطلوب'}, status=status.HTTP_400_BAD_REQUEST)
    
    # إنشاء تحليل جديد
    analysis = AIAnalysis.objects.create(
        user=request.user,
        analysis_type='content_moderation',
        input_text=content if content_type == 'text' else '',
        input_data={'content_type': content_type}
    )
    
    try:
        result = AIService.moderate_content(analysis)
        return Response({
            'analysis_id': analysis.id,
            'is_appropriate': result['is_appropriate'],
            'confidence': result['confidence'],
            'issues': result['issues'],
            'suggestions': result['suggestions'],
            'message': 'تم فحص المحتوى بنجاح'
        })
    except Exception as e:
        analysis.fail_processing(str(e))
        return Response({'error': 'فشل في فحص المحتوى'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def ai_stats(request):
    """إحصائيات الذكاء الاصطناعي"""
    user = request.user
    
    total_analyses = AIAnalysis.objects.filter(user=user).count()
    completed_analyses = AIAnalysis.objects.filter(user=user, status='completed').count()
    failed_analyses = AIAnalysis.objects.filter(user=user, status='failed').count()
    
    # متوسط وقت المعالجة
    avg_processing_time = AIAnalysis.objects.filter(
        user=user, 
        status='completed',
        processing_time__isnull=False
    ).aggregate(avg_time=Avg('processing_time'))['avg_time'] or 0
    
    # إحصائيات حسب النوع
    analyses_by_type = dict(
        AIAnalysis.objects.filter(user=user)
        .values('analysis_type')
        .annotate(count=Count('id'))
        .values_list('analysis_type', 'count')
    )
    
    # عدد التحليلات الحديثة (آخر 24 ساعة)
    recent_analyses_count = AIAnalysis.objects.filter(
        user=user,
        created_at__gte=timezone.now() - timedelta(hours=24)
    ).count()
    
    # إحصائيات البوت الذكي
    chatbot_sessions = ChatBot.objects.filter(user=user).count()
    active_chatbot_sessions = ChatBot.objects.filter(user=user, is_active=True).count()
    
    data = {
        'total_analyses': total_analyses,
        'completed_analyses': completed_analyses,
        'failed_analyses': failed_analyses,
        'avg_processing_time': avg_processing_time,
        'analyses_by_type': analyses_by_type,
        'recent_analyses_count': recent_analyses_count,
        'chatbot_sessions': chatbot_sessions,
        'active_chatbot_sessions': active_chatbot_sessions
    }
    
    serializer = AIStatsSerializer(data)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def ai_models(request):
    """قائمة نماذج الذكاء الاصطناعي المتاحة"""
    models = AIModel.objects.filter(is_active=True)
    serializer = AIModelSerializer(models, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def close_chatbot_session(request, session_id):
    """إغلاق جلسة البوت الذكي"""
    session = get_object_or_404(
        ChatBot, 
        session_id=session_id, 
        user=request.user
    )
    
    session.is_active = False
    session.save()
    
    return Response({'message': 'تم إغلاق الجلسة بنجاح'})

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def ai_capabilities(request):
    """قائمة قدرات الذكاء الاصطناعي المتاحة"""
    capabilities = {
        'image_analysis': {
            'name': 'تحليل الصور',
            'description': 'تصنيف وتحليل صور المخلفات',
            'supported_formats': ['jpg', 'jpeg', 'png', 'webp'],
            'max_file_size': '5MB'
        },
        'text_analysis': {
            'name': 'تحليل النصوص',
            'description': 'تحليل وتصنيف النصوص',
            'supported_languages': ['ar', 'en']
        },
        'price_suggestion': {
            'name': 'اقتراح الأسعار',
            'description': 'اقتراح أسعار مناسبة للمنتجات',
            'factors': ['الفئة', 'الحالة', 'الموقع', 'العرض والطلب']
        },
        'content_moderation': {
            'name': 'مراجعة المحتوى',
            'description': 'فحص المحتوى للتأكد من مناسبته',
            'checks': ['اللغة المسيئة', 'المحتوى غير المناسب', 'الرسائل المزعجة']
        },
        'chatbot': {
            'name': 'البوت الذكي',
            'description': 'مساعد ذكي للإجابة على الاستفسارات',
            'capabilities': ['الإجابة على الأسئلة', 'المساعدة في التصنيف', 'نصائح إعادة التدوير']
        }
    }
    
    return Response(capabilities)