from django.contrib import admin
from .models import User, UserRole

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'first_name', 'is_active', 'created_at']
    search_fields = ['email', 'first_name']

@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ['user', 'role']
    list_filter = ['role']
