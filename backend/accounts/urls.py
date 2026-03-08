from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, ProfileView, AdminUserListView, AdminAssignRoleView

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    # Admin
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<uuid:user_id>/role/', AdminAssignRoleView.as_view(), name='admin-assign-role'),
]
