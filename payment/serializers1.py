from rest_framework import serializers
from .models import Payment, PaymentMethod, PaymentHistory, Refund
from django.contrib.auth import get_user_model

User = get_user_model()


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'payment_type', 'card_last_four', 'card_brand', 
            'is_default', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class PaymentHistorySerializer(serializers.ModelSerializer):
    changed_by = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = PaymentHistory
        fields = [
            'id', 'previous_status', 'new_status', 'changed_by', 
            'change_reason', 'created_at'
        ]


class PaymentSerializer(serializers.ModelSerializer):
    payer = UserBasicSerializer(read_only=True)
    recipient = UserBasicSerializer(read_only=True)
    payment_method = PaymentMethodSerializer(read_only=True)
    history = PaymentHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'payment_id', 'order', 'payer', 'recipient', 'amount', 
            'currency', 'payment_method', 'payment_type', 'status', 
            'transaction_id', 'created_at', 'processed_at', 'completed_at', 
            'failed_at', 'description', 'failure_reason', 'history'
        ]
        read_only_fields = [
            'id', 'payment_id', 'payer', 'recipient', 'created_at', 
            'processed_at', 'completed_at', 'failed_at', 'transaction_id'
        ]


class CreatePaymentSerializer(serializers.ModelSerializer):
    payment_method_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'order', 'amount', 'currency', 'payment_method_id', 
            'description'
        ]
    
    def validate_payment_method_id(self, value):
        user = self.context['request'].user
        try:
            payment_method = PaymentMethod.objects.get(
                id=value, user=user, is_active=True
            )
        except PaymentMethod.DoesNotExist:
            raise serializers.ValidationError("Invalid payment method")
        return value
    
    def create(self, validated_data):
        payment_method_id = validated_data.pop('payment_method_id')
        payment_method = PaymentMethod.objects.get(id=payment_method_id)
        
        # Get order to determine payer and recipient
        order = validated_data['order']
        
        payment = Payment.objects.create(
            payer=self.context['request'].user,
            recipient=order.seller,
            payment_method=payment_method,
            **validated_data
        )
        return payment


class RefundSerializer(serializers.ModelSerializer):
    requested_by = UserBasicSerializer(read_only=True)
    processed_by = UserBasicSerializer(read_only=True)
    original_payment = PaymentSerializer(read_only=True)
    
    class Meta:
        model = Refund
        fields = [
            'id', 'refund_id', 'original_payment', 'refund_amount', 
            'reason', 'status', 'requested_by', 'processed_by',
            'external_refund_id', 'created_at', 'processed_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'refund_id', 'requested_by', 'processed_by',
            'external_refund_id', 'created_at', 'processed_at', 'completed_at'
        ]


class CreateRefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = ['original_payment', 'refund_amount', 'reason']
    
    def validate_original_payment(self, value):
        if value.status != 'completed':
            raise serializers.ValidationError("Can only refund completed payments")
        return value
    
    def validate_refund_amount(self, value):
        original_payment = self.initial_data.get('original_payment')
        if original_payment and value > original_payment.amount:
            raise serializers.ValidationError("Refund amount cannot exceed original payment")
        return value
    
    def create(self, validated_data):
        return Refund.objects.create(
            requested_by=self.context['request'].user,
            **validated_data
        )


class PaymentStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Payment.PAYMENT_STATUS_CHOICES)
    reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate_status(self, value):
        payment = self.context.get('payment')
        if not payment:
            return value
            
        # Define valid status transitions
        valid_transitions = {
            'pending': ['processing', 'cancelled'],
            'processing': ['completed', 'failed'],
            'completed': ['refunded'],
            'failed': ['pending'],
            'cancelled': ['pending'],
            'refunded': []
        }
        
        current_status = payment.status
        if value not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot change status from {current_status} to {value}"
            )
        
        return value