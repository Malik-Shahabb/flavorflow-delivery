from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user', 'restaurant', 'order', 'rating', 'comment', 'user_name', 'created_at']
        read_only_fields = ['id', 'user', 'user_name', 'created_at']

    def get_user_name(self, obj):
        return obj.user.first_name or obj.user.email
