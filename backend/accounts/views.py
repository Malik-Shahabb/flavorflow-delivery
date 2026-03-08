from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    UserRoleSerializer,
)
from .models import UserRole
from .permissions import IsAdmin

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — Register a new user."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"message": "User registered successfully", "user_id": str(user.id)},
            status=status.HTTP_201_CREATED,
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PUT /api/auth/profile/ — Get or update logged-in user's profile."""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class AdminUserListView(generics.ListAPIView):
    """GET /api/admin/users/ — List all users (admin only)."""
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdmin]


class AdminAssignRoleView(APIView):
    """PUT /api/admin/users/{id}/role/ — Assign role to user (admin only)."""
    permission_classes = [IsAdmin]

    def put(self, request, user_id):
        role = request.data.get('role')
        if role not in dict(UserRole.ROLE_CHOICES):
            return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        UserRole.objects.update_or_create(user=user, role=role)
        return Response({"message": f"Role '{role}' assigned to {user.email}"})
