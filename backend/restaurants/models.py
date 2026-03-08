import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField
from accounts.models import User


class Restaurant(models.Model):
    """Restaurant registered by an owner."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='restaurants')
    name = models.CharField(max_length=200)
    cuisine = models.CharField(max_length=100)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    review_count = models.IntegerField(default=0)
    delivery_time = models.CharField(max_length=50, default='30-45 min')
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=2.99)
    min_order = models.DecimalField(max_digits=6, decimal_places=2, default=10.00)
    image = models.URLField(
        default='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop'
    )
    address = models.TextField()
    is_open = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)
    tags = ArrayField(models.CharField(max_length=50), blank=True, default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'restaurants'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    """Menu item belonging to a restaurant."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.URLField(
        default='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop'
    )
    category = models.CharField(max_length=100, default='Mains')
    is_veg = models.BooleanField(default=False)
    is_popular = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'menu_items'

    def __str__(self):
        return f"{self.name} — ₹{self.price}"
