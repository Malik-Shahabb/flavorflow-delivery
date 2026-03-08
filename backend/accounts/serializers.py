from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserRole

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    full_name = serializers.CharField(source='first_name', required=False, default='')

    class Meta:
        model = User
        fields = ['email', 'password', 'full_name', 'phone']

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data.pop('password')
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=validated_data.get('first_name', ''),
            phone=validated_data.get('phone', ''),
        )
        # Assign default 'user' role
        UserRole.objects.create(user=user, role='user')
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='first_name')
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone', 'address', 'avatar_url', 'roles', 'created_at']
        read_only_fields = ['id', 'email', 'roles', 'created_at']

    def get_roles(self, obj):
        return list(obj.roles.values_list('role', flat=True))


class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = ['id', 'user', 'role']


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=6)
