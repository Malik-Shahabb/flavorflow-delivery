from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allow access only to users with 'admin' role."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.roles.filter(role='admin').exists()


class IsOwner(BasePermission):
    """Allow access only to users with 'owner' role."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.roles.filter(role='owner').exists()


class IsOwnerOrAdmin(BasePermission):
    """Allow access to owners or admins."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.roles.filter(role__in=['admin', 'owner']).exists()
