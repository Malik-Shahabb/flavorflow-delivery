from django.contrib import admin
from .models import Restaurant, MenuItem

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ['name', 'cuisine', 'owner', 'is_open', 'is_approved', 'rating']
    list_filter = ['is_open', 'is_approved', 'cuisine']
    search_fields = ['name', 'cuisine']

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'restaurant', 'price', 'category', 'is_veg', 'is_popular']
    list_filter = ['category', 'is_veg', 'is_popular']
