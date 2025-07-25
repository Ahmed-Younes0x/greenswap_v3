# from django.urls import path
# from . import views

# app_name = 'payments'

# urlpatterns = [
#     # Payment Methods
#     path('payment-methods/', views.PaymentMethodListCreateView.as_view(), name='payment-methods'),
#     path('payment-methods/<int:pk>/', views.PaymentMethodDetailView.as_view(), name='payment-method-detail'),
#     path('payment-methods/<int:pk>/set-default/', views.set_default_payment_method, name='set-default-payment-method'),
    
#     # Payments
#     path('payments/', views.PaymentListView.as_view(), name='payments'),
#     path('payments/create/', views.create_payment, name='create-payment'),
#     path('payments/<uuid:payment_id>/', views.PaymentDetailView.as_view(), name='payment-detail'),
#     path('payments/<uuid:payment_id>/status/', views.update_payment_status, name='update-payment-status'),
    
#     # Refunds
#     path('refunds/', views.RefundListCreateView.as_view(), name='refunds'),
#     path('refunds/<uuid:refund_id>/', views.RefundDetailView.as_view(), name='refund-detail'),
#     path('refunds/<uuid:refund_id>/process/', views.process_refund, name='process-refund'),
# ]
from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.CreatePaymentView.as_view(), name='create-payment'),
    path('user_payments/', views.PaymentMethodListCreateView.as_view(), name='payment-methods'),
    path('<int:pk>/verify/', views.VerifyPaymentView.as_view(), name='verify-payment'),
    path('<int:pk>/cancel/', views.CancelPaymentView.as_view(), name='cancel-payment'),
]
