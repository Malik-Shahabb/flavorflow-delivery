import uuid
from django.db import models
from accounts.models import User
from restaurants.models import Restaurant


class Order(models.Model):
    """Customer order."""
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('out-for-delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='orders')
    restaurant_name = models.CharField(max_length=200)
    items = models.JSONField(default=list)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    status_updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.id} — {self.restaurant_name} — {self.status}"


class OrderNotification(models.Model):
    """Notification sent to restaurant owner when a new order is placed."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='notifications')
    restaurant_name = models.CharField(max_length=200)
    customer_name = models.CharField(max_length=200, default='Customer')
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.restaurant_name} — Order {self.order_id}"
