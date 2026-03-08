from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Review
from .serializers import ReviewSerializer
from restaurants.models import Restaurant
from django.db.models import Avg


class RestaurantReviewListView(generics.ListAPIView):
    """GET /api/restaurants/{restaurant_id}/reviews/ — List reviews for a restaurant."""
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Review.objects.filter(restaurant_id=self.kwargs['restaurant_id'])


class ReviewCreateView(generics.CreateAPIView):
    """POST /api/reviews/ — Submit a review."""
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        review = serializer.save(user=self.request.user)

        # Update restaurant rating
        restaurant = review.restaurant
        avg = Review.objects.filter(restaurant=restaurant).aggregate(Avg('rating'))['rating__avg']
        count = Review.objects.filter(restaurant=restaurant).count()
        restaurant.rating = round(avg, 1)
        restaurant.review_count = count
        restaurant.save()
