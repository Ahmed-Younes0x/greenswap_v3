from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from .models import Payment, PaymentMethod, Refund, PaymentHistory
from .serializers import (
    PaymentSerializer, CreatePaymentSerializer, PaymentMethodSerializer,
    RefundSerializer, CreateRefundSerializer, PaymentStatusUpdateSerializer
)
import stripe
from django.conf import settings

# Configure Stripe (add this to your settings.py)
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')


class PaymentMethodListCreateView(generics.ListCreateAPIView):
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user, is_active=True)
    
    def perform_create(self, serializer):
        # If this is the first payment method, make it default
        if not PaymentMethod.objects.filter(user=self.request.user, is_active=True).exists():
            serializer.save(user=self.request.user, is_default=True)
        else:
            serializer.save(user=self.request.user)


class PaymentMethodDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)
    
    def perform_destroy(self, instance):
        # Soft delete - mark as inactive
        instance.is_active = False
        instance.save()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def set_default_payment_method(request, pk):
    payment_method = get_object_or_404(
        PaymentMethod, pk=pk, user=request.user, is_active=True
    )
    
    # Remove default from all other payment methods
    PaymentMethod.objects.filter(
        user=request.user, is_active=True
    ).update(is_default=False)
    
    # Set this one as default
    payment_method.is_default = True
    payment_method.save()
    
    return Response({'message': 'Default payment method updated'})


class PaymentListView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Payment.objects.filter(
            models.Q(payer=user) | models.Q(recipient=user)
        )
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by payment type if provided
        payment_type = self.request.query_params.get('payment_type')
        if payment_type:
            queryset = queryset.filter(payment_type=payment_type)
            
        return queryset


class PaymentDetailView(generics.RetrieveAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'payment_id'
    
    def get_queryset(self):
        user = self.request.user
        return Payment.objects.filter(
            models.Q(payer=user) | models.Q(recipient=user)
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_payment(request):
    serializer = CreatePaymentSerializer(
        data=request.data, 
        context={'request': request}
    )
    
    if serializer.is_valid():
        with transaction.atomic():
            payment = serializer.save()
            
            # Process payment based on payment method type
            success = process_payment(payment)
            
            if success:
                payment.status = 'processing'
                payment.processed_at = timezone.now()
                payment.save()
                
                return Response(
                    PaymentSerializer(payment).data,
                    status=status.HTTP_201_CREATED
                )
            else:
                payment.mark_as_failed("Payment processing failed")
                return Response(
                    {'error': 'Payment processing failed'},
                    status=status.HTTP_400_BAD_REQUEST
                )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_payment_status(request, payment_id):
    payment = get_object_or_404(Payment, payment_id=payment_id)
    
    # Check permissions - only payment processor or admin can update
    if not (request.user.is_staff or request.user == payment.payer):
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = PaymentStatusUpdateSerializer(
        data=request.data,
        context={'payment': payment, 'request': request}
    )
    
    if serializer.is_valid():
        old_status = payment.status
        new_status = serializer.validated_data['status']
        reason = serializer.validated_data.get('reason', '')
        
        with transaction.atomic():
            # Update payment status
            payment.status = new_status
            
            if new_status == 'completed':
                payment.mark_as_completed()
            elif new_status == 'failed':
                payment.mark_as_failed(reason)
            else:
                payment.save()
            
            # Create history record
            PaymentHistory.objects.create(
                payment=payment,
                previous_status=old_status,
                new_status=new_status,
                changed_by=request.user,
                change_reason=reason
            )
        
        return Response(PaymentSerializer(payment).data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RefundListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateRefundSerializer
        return RefundSerializer
    
    def get_queryset(self):
        user = self.request.user
        return Refund.objects.filter(
            models.Q(requested_by=user) | 
            models.Q(original_payment__recipient=user)
        )
    
    def perform_create(self, serializer):
        serializer.save()


class RefundDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'refund_id'
    
    def get_queryset(self):
        user = self.request.user
        return Refund.objects.filter(
            models.Q(requested_by=user) | 
            models.Q(original_payment__recipient=user)
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def process_refund(request, refund_id):
    refund = get_object_or_404(Refund, refund_id=refund_id)
    
    # Check permissions - only recipient or admin can process refunds
    if not (request.user.is_staff or request.user == refund.original_payment.recipient):
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    if refund.status != 'pending':
        return Response(
            {'error': 'Refund already processed'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    with transaction.atomic():
        refund.status = 'processing'
        refund.processed_by = request.user
        refund.processed_at = timezone.now()
        refund.save()
        
        # Process refund through payment gateway
        success = process_payment_refund(refund)
        
        if success:
            refund.status = 'completed'
            refund.completed_at = timezone.now()
            refund.save()
            
            # Update original payment if full refund
            if refund.refund_amount == refund.original_payment.amount:
                refund.original_payment.status = 'refunded'
                refund.original_payment.save()
            
            return Response(RefundSerializer(refund).data)
        else:
            refund.status = 'failed'
            refund.save()
            return Response(
                {'error': 'Refund processing failed'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


def process_payment(payment):
    """
    Process payment through the appropriate gateway
    This is a simplified version - implement based on your payment provider
    """
    try:
        if payment.payment_method.payment_type == 'stripe':
            # Stripe payment processing
            intent = stripe.PaymentIntent.create(
                amount=int(payment.amount * 100),  # Stripe uses cents
                currency=payment.currency.lower(),
                metadata={
                    'payment_id': str(payment.payment_id),
                    'order_id': payment.order.id
                }
            )
            payment.transaction_id = intent.id
            payment.gateway_response = intent
            payment.save()
            return True
        
        elif payment.payment_method.payment_type == 'paypal':
            # PayPal processing would go here
            pass
        
        # Add other payment processors as needed
        return True
        
    except Exception as e:
        payment.failure_reason = str(e)
        payment.save()
        return False


def process_payment_refund(refund):
    """
    Process refund through the appropriate gateway
    """
    try:
        original_payment = refund.original_payment
        
        if original_payment.payment_method.payment_type == 'stripe':
            # Stripe refund processing
            stripe_refund = stripe.Refund.create(
                payment_intent=original_payment.transaction_id,
                amount=int(refund.refund_amount * 100),
                metadata={
                    'refund_id': str(refund.refund_id),
                    'original_payment_id': str(original_payment.payment_id)
                }
            )
            refund.external_refund_id = stripe_refund.id
            refund.gateway_response = stripe_refund
            refund.save()
            return True
        
        # Add other payment processors as needed
        return True
        
    except Exception as e:
        return False