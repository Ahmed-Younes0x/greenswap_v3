from django.urls import path
from .views import (
    ReportListCreateView, ReportDetailView, review_report,
    take_action_on_report, reports_stats
)

urlpatterns = [
    path('', ReportListCreateView.as_view(), name='report-list'),
    path('<int:pk>/', ReportDetailView.as_view(), name='report-detail'),
    path('<int:report_id>/review/', review_report, name='review-report'),
    path('<int:report_id>/action/', take_action_on_report, name='take-action-report'),
    path('stats/', reports_stats, name='reports-stats'),
]