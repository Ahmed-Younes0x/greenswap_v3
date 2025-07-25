from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['is_verified', 'created_at', 'verified_at', 'staff_verified_by']
