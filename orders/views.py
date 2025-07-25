from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Order, OrderMessage, OrderTracking, OrderRating
from .serializers import (
    OrderSerializer, OrderCreateSerializer, OrderMessageSerializer,
    OrderTrackingSerializer, OrderRatingSerializer, OrderUpdateSerializer
)
from .permissions import IsOrderParticipant

class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Order.objects.filter(Q(buyer=user) | Q(seller=user))

class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        print("Creating order with data:", request.data)
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            print("Validation error: yup ", e)
        return super().create(request, *args, **kwargs)

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrderParticipant]

    def get_queryset(self):
        user = self.request.user
        return Order.objects.filter(Q(buyer=user) | Q(seller=user))

class OrderUpdateView(generics.UpdateAPIView):
    serializer_class = OrderUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrderParticipant]

    def get_queryset(self):
        return Order.objects.filter(seller=self.request.user)

class MyOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        order_type = self.request.query_params.get('type', 'all')
        
        if order_type == 'buying':
            return Order.objects.filter(buyer=user)
        elif order_type == 'selling':
            return Order.objects.filter(seller=user)
        else:
            return Order.objects.filter(Q(buyer=user) | Q(seller=user))

class OrderMessagesView(generics.ListCreateAPIView):
    serializer_class = OrderMessageSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrderParticipant]

    def get_queryset(self):
        order_id = self.kwargs.get('order_id')
        return OrderMessage.objects.filter(order_id=order_id)

    def perform_create(self, serializer):
        order_id = self.kwargs.get('order_id')
        order = get_object_or_404(Order, id=order_id)
        serializer.save(order=order, sender=self.request.user)

class OrderTrackingView(generics.ListCreateAPIView):
    serializer_class = OrderTrackingSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrderParticipant]

    def get_queryset(self):
        order_id = self.kwargs.get('order_id')
        return OrderTracking.objects.filter(order_id=order_id)

    def perform_create(self, serializer):
        order_id = self.kwargs.get('order_id')
        order = get_object_or_404(Order, id=order_id)
        serializer.save(order=order, created_by=self.request.user)

class OrderRatingView(generics.ListCreateAPIView):
    serializer_class = OrderRatingSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrderParticipant]

    def get_queryset(self):
        order_id = self.kwargs.get('order_id')
        return OrderRating.objects.filter(order_id=order_id)

    def perform_create(self, serializer):
        order_id = self.kwargs.get('order_id')
        order = get_object_or_404(Order, id=order_id)
        
        # Determine rating type and rated user
        if self.request.user == order.buyer:
            rating_type = 'buyer_to_seller'
            rated_user = order.seller
        else:
            rating_type = 'seller_to_buyer'
            rated_user = order.buyer
        
        serializer.save(
            order=order,
            rater=self.request.user,
            rated_user=rated_user,
            rating_type=rating_type
        )
        
        # Update user rating
        rated_user.update_rating()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def accept_order(request, order_id):
    order = get_object_or_404(Order, id=order_id, seller=request.user)
    
    if order.status != 'pending':
        return Response({'error': 'لا يمكن قبول هذا الطلب'}, status=status.HTTP_400_BAD_REQUEST)
    
    order.accept_order()
    
    # Create tracking
    OrderTracking.objects.create(
        order=order,
        status='order_accepted',
        description='تم قبول الطلب من قبل البائع',
        created_by=request.user
    )
    
    return Response({'message': 'تم قبول الطلب بنجاح'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_order(request, order_id):
    order = get_object_or_404(Order, id=order_id, seller=request.user)
    
    if order.status != 'pending':
        return Response({'error': 'لا يمكن رفض هذا الطلب'}, status=status.HTTP_400_BAD_REQUEST)
    
    order.reject_order()
    
    # Create tracking
    OrderTracking.objects.create(
        order=order,
        status='order_rejected',
        description='تم رفض الطلب من قبل البائع',
        created_by=request.user
    )
    
    return Response({'message': 'تم رفض الطلب'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_order(request, order_id):
    order = get_object_or_404(Order, id=order_id, seller=request.user)
    
    if order.status != 'accepted':
        return Response({'error': 'لا يمكن إكمال هذا الطلب'}, status=status.HTTP_400_BAD_REQUEST)
    
    order.complete_order()
    
    # Create tracking
    OrderTracking.objects.create(
        order=order,
        status='delivered',
        description='تم تسليم الطلب بنجاح',
        created_by=request.user
    )
    
    return Response({'message': 'تم إكمال الطلب بنجاح'})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_order(request, order_id):
    order = get_object_or_404(Order, id=order_id, buyer=request.user)
    
    if order.status not in ['pending', 'accepted']:
        return Response({'error': 'لا يمكن إلغاء هذا الطلب'}, status=status.HTTP_400_BAD_REQUEST)
    
    order.status = 'cancelled'
    order.save()
    
    # Create tracking
    OrderTracking.objects.create(
        order=order,
        status='order_cancelled',
        description='تم إلغاء الطلب من قبل المشتري',
        created_by=request.user
    )
    
    return Response({'message': 'تم إلغاء الطلب'})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def order_stats(request):
    user = request.user
    
    buying_stats = Order.objects.filter(buyer=user).aggregate(
        total_orders=models.Count('id'),
        completed_orders=models.Count('id', filter=models.Q(status='completed')),
        total_spent=models.Sum('total_price', filter=models.Q(status='completed'))
    )
    
    selling_stats = Order.objects.filter(seller=user).aggregate(
        total_sales=models.Count('id'),
        completed_sales=models.Count('id', filter=models.Q(status='completed')),
        total_earned=models.Sum('total_price', filter=models.Q(status='completed'))
    )
    
    return Response({
        'buying': {
            'total_orders': buying_stats['total_orders'] or 0,
            'completed_orders': buying_stats['completed_orders'] or 0,
            'total_spent': buying_stats['total_spent'] or 0
        },
        'selling': {
            'total_sales': selling_stats['total_sales'] or 0,
            'completed_sales': selling_stats['completed_sales'] or 0,
            'total_earned': selling_stats['total_earned'] or 0
        }
    })