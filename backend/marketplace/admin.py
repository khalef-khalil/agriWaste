from django.contrib import admin
from .models import WasteListing, ListingImage, Order, Review, Message

class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 1

@admin.register(WasteListing)
class WasteListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'seller', 'waste_type', 'price', 'quantity', 'unit', 'status', 'created_at')
    list_filter = ('status', 'unit', 'created_at', 'waste_type')
    search_fields = ('title', 'description', 'seller__username', 'location')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ListingImageInline]

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'buyer', 'listing', 'quantity', 'total_price', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('buyer__username', 'listing__title', 'shipping_address')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('reviewer', 'listing', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('comment', 'reviewer__username', 'listing__title')
    readonly_fields = ('created_at',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('subject', 'sender', 'receiver', 'read', 'created_at')
    list_filter = ('read', 'created_at')
    search_fields = ('subject', 'content', 'sender__username', 'receiver__username')
    readonly_fields = ('created_at',)
