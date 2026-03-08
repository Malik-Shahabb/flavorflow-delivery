from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from .models import Restaurant, MenuItem
from .serializers import (
    RestaurantListSerializer,
    RestaurantDetailSerializer,
    MenuItemSerializer,
)
from accounts.permissions import IsAdmin, IsOwner
from accounts.models import UserRole


class RestaurantListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/restaurants/         — List all approved restaurants (public)
    POST /api/restaurants/         — Register a new restaurant (authenticated)
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = Restaurant.objects.all()
        if self.request.method == 'GET':
            qs = qs.filter(is_approved=True)

        # Filters
        cuisine = self.request.query_params.get('cuisine')
        if cuisine:
            qs = qs.filter(cuisine__icontains=cuisine)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(name__icontains=search)

        is_open = self.request.query_params.get('is_open')
        if is_open == 'true':
            qs = qs.filter(is_open=True)

        return qs

    def get_serializer_class(self):
        return RestaurantListSerializer

    def perform_create(self, serializer):
        restaurant = serializer.save(owner=self.request.user)
        # Auto-assign 'owner' role if not already present
        UserRole.objects.get_or_create(user=self.request.user, role='owner')
        return restaurant


class RestaurantDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/restaurants/{id}/  — Restaurant detail with menu (public)
    PUT    /api/restaurants/{id}/  — Update restaurant (owner only)
    DELETE /api/restaurants/{id}/  — Delete restaurant (owner only)
    """
    queryset = Restaurant.objects.all()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        return RestaurantDetailSerializer

    def update(self, request, *args, **kwargs):
        restaurant = self.get_object()
        if restaurant.owner != request.user:
            return Response(
                {"error": "You can only update your own restaurant"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        restaurant = self.get_object()
        if restaurant.owner != request.user:
            return Response(
                {"error": "You can only delete your own restaurant"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)


class MenuItemListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/restaurants/{restaurant_id}/menu/  — List menu items
    POST /api/restaurants/{restaurant_id}/menu/  — Add menu item (owner only)
    """
    serializer_class = MenuItemSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return MenuItem.objects.filter(restaurant_id=self.kwargs['restaurant_id'])

    def perform_create(self, serializer):
        restaurant = Restaurant.objects.get(id=self.kwargs['restaurant_id'])
        if restaurant.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only add items to your own restaurant")
        serializer.save(restaurant=restaurant)


class MenuItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/DELETE /api/menu-items/{id}/ — Manage a menu item (owner only for write)
    """
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def update(self, request, *args, **kwargs):
        item = self.get_object()
        if item.restaurant.owner != request.user:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        item = self.get_object()
        if item.restaurant.owner != request.user:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class AdminRestaurantListView(generics.ListAPIView):
    """GET /api/admin/restaurants/ — List ALL restaurants (admin only)."""
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantListSerializer
    permission_classes = [IsAdmin]


class AdminApproveRestaurantView(APIView):
    """PUT /api/admin/restaurants/{id}/approve/ — Approve a restaurant."""
    permission_classes = [IsAdmin]

    def put(self, request, pk):
        try:
            restaurant = Restaurant.objects.get(id=pk)
        except Restaurant.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        restaurant.is_approved = True
        restaurant.save()
        return Response({"message": f"Restaurant '{restaurant.name}' approved"})
