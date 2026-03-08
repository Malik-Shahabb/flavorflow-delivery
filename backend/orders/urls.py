from django.urls import path
from .views import (
    OrderListCreateView,
    OrderDetailView,
    OrderStatusUpdateView,
    OrderCancelView,
    OwnerOrdersView,
    NotificationListView,
    NotificationMarkReadView,
)

urlpatterns = [
    path('orders/', OrderListCreateView.as_view(), name='order-list'),
    path('orders/<uuid:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<uuid:pk>/status/', OrderStatusUpdateView.as_view(), name='order-status'),
    path('orders/<uuid:pk>/cancel/', OrderCancelView.as_view(), name='order-cancel'),
    path('owner/orders/', OwnerOrdersView.as_view(), name='owner-orders'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/<uuid:pk>/read/', NotificationMarkReadView.as_view(), name='notification-read'),
]
