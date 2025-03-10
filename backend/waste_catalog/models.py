from django.db import models

# Create your models here.

class WasteCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='waste_categories/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Waste Categories"
        ordering = ['-created_at']

class WasteType(models.Model):
    category = models.ForeignKey(WasteCategory, on_delete=models.CASCADE, related_name='waste_types')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    potential_uses = models.TextField(blank=True, null=True)
    sustainability_score = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True)
    image = models.ImageField(upload_to='waste_types/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.category.name})"

    class Meta:
        ordering = ['-created_at']

class ResourceDocument(models.Model):
    DOCUMENT_TYPES = (
        ('RESEARCH', 'Research Paper'),
        ('GUIDE', 'Usage Guide'),
        ('REGULATION', 'Regulation Document'),
        ('CASE_STUDY', 'Case Study'),
        ('OTHER', 'Other'),
    )
    
    waste_type = models.ForeignKey(WasteType, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    author = models.CharField(max_length=255, blank=True, null=True)
    publication_date = models.DateField(blank=True, null=True)
    file = models.FileField(upload_to='documents/')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']
