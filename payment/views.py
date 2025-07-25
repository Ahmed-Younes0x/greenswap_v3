from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser,AllowAny
from rest_framework.response import Response
from django.utils import timezone
from .models import Payment
from .serializers import PaymentSerializer
from orders.models import Order

class PaymentMethodListCreateView(generics.ListCreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]  # Allow any user to view payment methods
    def get_queryset(self):
        return self.queryset.filter(order__buyer=self.request.user)
    def perform_create(self, serializer):
        # Ensure the payment method is linked to the authenticated user
        serializer.save(user=self.request.user)
    def create(self, request, *args, **kwargs):
        print(request.data,'line 20')
        return super().create(request, *args, **kwargs)
        
class CreatePaymentView(generics.CreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)

            serializer.is_valid(raise_exception=True)
            
            order = serializer.validated_data['order']
            
            if order.buyer != request.user:
                return Response(
                    {"detail": "You can only pay for your own orders."},
                    status=status.HTTP_403_FORBIDDEN
                )
                
            if Payment.objects.filter(order=order, is_cancelled=False).exists():
                return Response(
                    {"detail": "There is already a pending payment for this order."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            order.payment_status = "verifying"
            self.perform_create(serializer)
            order.save()
            
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
            
        except Exception as e:
            print(f"Error in payment creation: {str(e)}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_409_CONFLICT
            )

    def perform_create(self, serializer):
        # This just saves the payment without additional logic
        serializer.save()

class VerifyPaymentView(generics.UpdateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    # permission_classes = [IsAdminUser]
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        payment = self.get_object()
        payment.is_verified = True
        payment.verified_at = timezone.now()
        payment.staff_verified_by = request.user
        payment.save()
        
        # Update order
        payment.order.payment_status = "paid"
        payment.order.status = "completed"
        payment.order.payment_date = payment.verified_at
        payment.order.item.status = "sold"
        payment.order.item.save()
        payment.order.save()

        return Response(PaymentSerializer(payment).data)

class CancelPaymentView(generics.UpdateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk, *args, **kwargs):
        try:
            # Get the payment that's related to this order ID
            payment = Payment.objects.get(order__id=pk)
            order = payment.order
            
            print(f"Attempting to cancel payment for order {pk} by user {request.user.username}")

            # Validate user can cancel this payment
            if order.buyer != request.user and not request.user.is_staff:
                return Response(
                    {"detail": "You can only cancel your own payments."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Only allow cancellation if payment is still verifying
            if order.payment_status != "verifying":
                return Response(
                    {"detail": "Payment cannot be cancelled at this stage."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update payment and order
            payment.is_cancelled = True
            payment.save()
            
            order.payment_status = "unpaid"
            order.save()

            return Response(
                {
                    "detail": "Payment cancelled successfully.",
                    "payment": PaymentSerializer(payment).data,
                    "order_status": order.status,
                    "payment_status": order.payment_status
                },
                status=status.HTTP_200_OK
            )

        except Payment.DoesNotExist:
            return Response(
                {"detail": "Payment not found for this order."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )