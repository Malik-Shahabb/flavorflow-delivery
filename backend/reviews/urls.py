from django.urls import path
from .views import RestaurantReviewListView, ReviewCreateView

urlpatterns = [
    path('restaurants/<uuid:restaurant_id>/reviews/', RestaurantReviewListView.as_view(), name='restaurant-reviews'),
    path('reviews/', ReviewCreateView.as_view(), name='review-create'),
]
