from django.urls import path
from .views import (
    RestaurantListCreateView,
    RestaurantDetailView,
    MenuItemListCreateView,
    MenuItemDetailView,
    AdminRestaurantListView,
    AdminApproveRestaurantView,
)

urlpatterns = [
    path('restaurants/', RestaurantListCreateView.as_view(), name='restaurant-list'),
    path('restaurants/<uuid:pk>/', RestaurantDetailView.as_view(), name='restaurant-detail'),
    path('restaurants/<uuid:restaurant_id>/menu/', MenuItemListCreateView.as_view(), name='menu-list'),
    path('menu-items/<uuid:pk>/', MenuItemDetailView.as_view(), name='menu-item-detail'),
    # Admin
    path('admin/restaurants/', AdminRestaurantListView.as_view(), name='admin-restaurants'),
    path('admin/restaurants/<uuid:pk>/approve/', AdminApproveRestaurantView.as_view(), name='admin-approve'),
]
