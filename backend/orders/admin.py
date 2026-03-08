from django.contrib import admin
from .models import Order, OrderNotification

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'restaurant_name', 'total', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['restaurant_name']

@admin.register(OrderNotification)
class OrderNotificationAdmin(admin.ModelAdmin):
    list_display = ['restaurant_name', 'customer_name', 'total', 'is_read', 'created_at']
    list_filter = ['is_read']
