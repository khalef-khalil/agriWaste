from django.db import models
from django.contrib.auth.models import User
from waste_catalog.models import WasteType

class WasteListing(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('SOLD', 'Sold'),
        ('EXPIRED', 'Expired'),
        ('PAUSED', 'Paused'),
    )
    
    QUANTITY_UNITS = (
        ('KG', 'Kilograms'),
        ('TON', 'Tons'),
        ('CUBIC_M', 'Cubic Meters'),
        ('LITER', 'Liters'),
        ('UNIT', 'Units'),
    )
    
    COUNTRY_CHOICES = (
        ('TN', 'Tunisia'),
        ('LY', 'Libya'),
        ('DZ', 'Algeria'),
    )
    
    CURRENCY_CHOICES = (
        ('TND', 'Tunisian Dinar'),
        ('LYD', 'Libyan Dinar'),
        ('DZD', 'Algerian Dinar'),
    )
    
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings')
    waste_type = models.ForeignKey(WasteType, on_delete=models.CASCADE, related_name='listings')
    title = models.CharField(max_length=255)
    description = models.TextField()
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=10, choices=QUANTITY_UNITS)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='TND')
    location = models.CharField(max_length=255)
    country = models.CharField(max_length=2, choices=COUNTRY_CHOICES, default='TN')
    available_from = models.DateField()
    available_until = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

class ListingImage(models.Model):
    listing = models.ForeignKey(WasteListing, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='listing_images/')
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Image for {self.listing.title}"

    class Meta:
        ordering = ['-created_at']

class Order(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    )
    
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    listing = models.ForeignKey(WasteListing, on_delete=models.CASCADE, related_name='orders')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_address = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order #{self.id} - {self.buyer.username}"

    class Meta:
        ordering = ['-created_at']

class Review(models.Model):
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    listing = models.ForeignKey(WasteListing, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Review by {self.reviewer.username} for {self.listing.title}"

    class Meta:
        ordering = ['-created_at']
        unique_together = ('reviewer', 'listing')  # Prevent duplicate reviews

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    listing = models.ForeignKey(WasteListing, on_delete=models.CASCADE, related_name='messages', blank=True, null=True)
    subject = models.CharField(max_length=255)
    content = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Message from {self.sender.username} to {self.receiver.username}"

    class Meta:
        ordering = ['-created_at']
