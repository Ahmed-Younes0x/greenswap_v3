from celery import shared_task
from .models import AIAnalysis
from .services import AIService

@shared_task
def process_ai_analysis(analysis_id):
    """معالجة تحليل الذكاء الاصطناعي في الخلفية"""
    try:
        analysis = AIAnalysis.objects.get(id=analysis_id)
        
        if analysis.analysis_type == 'image_classification':
            AIService.analyze_image(analysis)
        elif analysis.analysis_type == 'text_analysis':
            AIService.analyze_text(analysis)
        elif analysis.analysis_type == 'price_suggestion':
            AIService.suggest_price(analysis)
        elif analysis.analysis_type == 'content_moderation':
            AIService.moderate_content(analysis)
        
        return f"Analysis {analysis_id} completed successfully"
        
    except AIAnalysis.DoesNotExist:
        return f"Analysis {analysis_id} not found"
    except Exception as e:
        return f"Error processing analysis {analysis_id}: {str(e)}"

@shared_task
def cleanup_old_analyses():
    """تنظيف التحليلات القديمة"""
    from django.utils import timezone
    from datetime import timedelta
    
    # حذف التحليلات الأقدم من 30 يوم
    old_date = timezone.now() - timedelta(days=30)
    deleted_count = AIAnalysis.objects.filter(created_at__lt=old_date).delete()[0]
    
    return f"Deleted {deleted_count} old analyses"

@shared_task
def update_model_metrics():
    """تحديث مقاييس أداء النماذج"""
    from .models import AIModel
    from django.db.models import Avg, Count
    
    for model in AIModel.objects.filter(is_active=True):
        # حساب الإحصائيات من التحليلات
        analyses = AIAnalysis.objects.filter(
            analysis_type=model.model_type,
            status__in=['completed', 'failed']
        )
        
        total_requests = analyses.count()
        successful_requests = analyses.filter(status='completed').count()
        avg_processing_time = analyses.filter(
            status='completed',
            processing_time__isnull=False
        ).aggregate(avg_time=Avg('processing_time'))['avg_time'] or 0
        
        # تحديث النموذج
        model.total_requests = total_requests
        model.successful_requests = successful_requests
        model.avg_processing_time = avg_processing_time
        
        if total_requests > 0:
            model.accuracy = (successful_requests / total_requests) * 100
        
        model.save()
    
    return "Model metrics updated successfully"