from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import Order, OrderNotification
from .serializers import (
    OrderSerializer,
    OrderCreateSerializer,
    OrderStatusUpdateSerializer,
    OrderNotificationSerializer,
)
from restaurants.models import Restaurant


class OrderListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/orders/     — List user's orders
    POST /api/orders/     — Place a new order
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    """GET /api/orders/{id}/ — Get order details."""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderStatusUpdateView(APIView):
    """PUT /api/orders/{id}/status/ — Update order status (restaurant owner only)."""
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            order = Order.objects.get(id=pk)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check that requesting user is the restaurant owner
        if order.restaurant.owner != request.user:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order.status = serializer.validated_data['status']
        order.save()
        return Response(OrderSerializer(order).data)


class OrderCancelView(APIView):
    """PUT /api/orders/{id}/cancel/ — Cancel order (customer, only if confirmed)."""
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            order = Order.objects.get(id=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        if order.status != 'confirmed':
            return Response(
                {"error": "Can only cancel orders that are still confirmed"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = 'cancelled'
        order.save()
        return Response(OrderSerializer(order).data)


class OwnerOrdersView(generics.ListAPIView):
    """GET /api/owner/orders/ — List orders for owner's restaurants."""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        restaurant_ids = Restaurant.objects.filter(
            owner=self.request.user
        ).values_list('id', flat=True)
        return Order.objects.filter(restaurant_id__in=restaurant_ids)


class NotificationListView(generics.ListAPIView):
    """GET /api/notifications/ — List owner's notifications."""
    serializer_class = OrderNotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return OrderNotification.objects.filter(owner=self.request.user)


class NotificationMarkReadView(APIView):
    """PUT /api/notifications/{id}/read/ — Mark notification as read."""
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            notif = OrderNotification.objects.get(id=pk, owner=request.user)
        except OrderNotification.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        notif.is_read = True
        notif.save()
        return Response({"message": "Marked as read"})
