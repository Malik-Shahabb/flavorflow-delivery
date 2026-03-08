from rest_framework import serializers
from .models import Restaurant, MenuItem


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = [
            'id', 'restaurant', 'name', 'description', 'price',
            'image', 'category', 'is_veg', 'is_popular', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class RestaurantListSerializer(serializers.ModelSerializer):
    """Serializer for listing restaurants (without full menu)."""
    class Meta:
        model = Restaurant
        fields = [
            'id', 'owner', 'name', 'cuisine', 'rating', 'review_count',
            'delivery_time', 'delivery_fee', 'min_order', 'image',
            'address', 'is_open', 'is_approved', 'tags', 'created_at',
        ]
        read_only_fields = ['id', 'owner', 'rating', 'review_count', 'is_approved', 'created_at']


class RestaurantDetailSerializer(serializers.ModelSerializer):
    """Serializer for restaurant detail with full menu."""
    menu_items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            'id', 'owner', 'name', 'cuisine', 'rating', 'review_count',
            'delivery_time', 'delivery_fee', 'min_order', 'image',
            'address', 'is_open', 'is_approved', 'tags', 'created_at',
            'menu_items',
        ]
        read_only_fields = ['id', 'owner', 'rating', 'review_count', 'is_approved', 'created_at']
