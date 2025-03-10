from django.contrib import admin
from .models import WasteCategory, WasteType, ResourceDocument

@admin.register(WasteCategory)
class WasteCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(WasteType)
class WasteTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'sustainability_score', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'description', 'potential_uses')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(ResourceDocument)
class ResourceDocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'waste_type', 'document_type', 'author', 'publication_date')
    list_filter = ('document_type', 'publication_date', 'created_at')
    search_fields = ('title', 'author', 'description')
    readonly_fields = ('created_at', 'updated_at')
