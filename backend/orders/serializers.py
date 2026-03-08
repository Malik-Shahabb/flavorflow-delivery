from rest_framework import serializers
from .models import Order, OrderNotification


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'restaurant', 'restaurant_name', 'items',
            'subtotal', 'delivery_fee', 'total', 'status',
            'status_updated_at', 'created_at',
        ]
        read_only_fields = ['id', 'user', 'status', 'status_updated_at', 'created_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'restaurant', 'restaurant_name', 'items',
            'subtotal', 'delivery_fee', 'total',
        ]

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        order = Order.objects.create(**validated_data)

        # Create notification for restaurant owner
        restaurant = order.restaurant
        OrderNotification.objects.create(
            owner=restaurant.owner,
            order=order,
            restaurant_name=order.restaurant_name,
            customer_name=order.user.first_name or order.user.email,
            total=order.total,
        )
        return order


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)


class OrderNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderNotification
        fields = [
            'id', 'owner', 'order', 'restaurant_name',
            'customer_name', 'total', 'is_read', 'created_at',
        ]
        read_only_fields = ['id', 'owner', 'order', 'restaurant_name', 'customer_name', 'total', 'created_at']
