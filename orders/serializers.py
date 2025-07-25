from rest_framework import serializers
from .models import Order, OrderMessage, OrderTracking, OrderRating
from accounts.serializers import UserPublicSerializer
from items.serializers import ItemListSerializer

class OrderSerializer(serializers.ModelSerializer):
    buyer = UserPublicSerializer(read_only=True)
    seller = UserPublicSerializer(read_only=True)
    item = ItemListSerializer(read_only=True)
    can_accept = serializers.SerializerMethodField()
    can_reject = serializers.SerializerMethodField()
    can_complete = serializers.SerializerMethodField()
    can_cancel = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'order_number', 'buyer', 'seller', 'item', 'quantity', 'unit_price', 
                 'total_price', 'status', 'payment_status', 'delivery_address', 'delivery_phone',
                 'delivery_notes', 'created_at', 'updated_at', 'accepted_at', 'completed_at',
                 'expected_delivery_date', 'buyer_notes', 'seller_notes', 'can_accept',
                 'can_reject', 'can_complete', 'can_cancel']
        read_only_fields = ['id', 'order_number', 'total_price', 'created_at', 'updated_at']

    def get_can_accept(self, obj):
        request = self.context.get('request')
        if request and request.user == obj.seller:
            return obj.status == 'pending'
        return False

    def get_can_reject(self, obj):
        request = self.context.get('request')
        if request and request.user == obj.seller:
            return obj.status == 'pending'
        return False

    def get_can_complete(self, obj):
        request = self.context.get('request')
        if request and request.user == obj.seller:
            return obj.status == 'accepted'
        return False

    def get_can_cancel(self, obj):
        request = self.context.get('request')
        if request and request.user == obj.buyer:
            return obj.status in ['pending', 'accepted']
        return False

class OrderCreateSerializer(serializers.ModelSerializer):
    item_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Order
        fields = ['item_id', 'quantity', 'delivery_address', 'delivery_phone', 'delivery_notes', 'buyer_notes']

    def validate_item_id(self, value):
        from items.models import Item
        try:
            item = Item.objects.get(id=value)
            if item.status != 'available':
                raise serializers.ValidationError('هذا المنتج غير متاح')
            return value
        except Item.DoesNotExist:
            raise serializers.ValidationError('المنتج غير موجود')

    def validate(self, attrs):
        from items.models import Item
        item = Item.objects.get(id=attrs['item_id'])
        
        if attrs['quantity'] > item.quantity:
            raise serializers.ValidationError('الكمية المطلوبة أكبر من المتاح')
        
        if item.owner == self.context['request'].user:
            raise serializers.ValidationError('لا يمكنك طلب منتجك الخاص')
        
        return attrs

    def create(self, validated_data):
        from items.models import Item
        item_id = validated_data.pop('item_id')
        item = Item.objects.get(id=item_id)
        
        order = Order.objects.create(
            buyer=self.context['request'].user,
            seller=item.owner,
            item=item,
            unit_price=item.price,
            **validated_data
        )
        
        # Create initial tracking
        OrderTracking.objects.create(
            order=order,
            status='order_placed',
            description='تم تقديم الطلب بنجاح',
            created_by=order.buyer
        )
        
        return order

class OrderMessageSerializer(serializers.ModelSerializer):
    sender = UserPublicSerializer(read_only=True)

    class Meta:
        model = OrderMessage
        fields = ['id', 'sender', 'message', 'created_at', 'is_read']
        read_only_fields = ['id', 'created_at', 'is_read']

class OrderTrackingSerializer(serializers.ModelSerializer):
    created_by = UserPublicSerializer(read_only=True)

    class Meta:
        model = OrderTracking
        fields = ['id', 'status', 'description', 'created_at', 'created_by']
        read_only_fields = ['id', 'created_at']

class OrderRatingSerializer(serializers.ModelSerializer):
    rater = UserPublicSerializer(read_only=True)
    rated_user = UserPublicSerializer(read_only=True)

    class Meta:
        model = OrderRating
        fields = ['id', 'rater', 'rated_user', 'rating_type', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']

class OrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status', 'seller_notes', 'expected_delivery_date']
        
    def validate_status(self, value):
        current_status = self.instance.status
        allowed_transitions = {
            'pending': ['accepted', 'rejected'],
            'accepted': ['in_progress', 'cancelled'],
            'in_progress': ['completed', 'cancelled'],
        }
        
        if value not in allowed_transitions.get(current_status, []):
            raise serializers.ValidationError(f'لا يمكن تغيير الحالة من {current_status} إلى {value}')
        
        return value