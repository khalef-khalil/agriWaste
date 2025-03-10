from django.shortcuts import render
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import WasteCategory, WasteType, ResourceDocument
from .serializers import (
    WasteCategorySerializer, 
    WasteTypeSerializer, 
    WasteTypeDetailSerializer,
    ResourceDocumentSerializer
)

# Import or define AllowAnyReadOnly
class AllowAnyReadOnly(permissions.BasePermission):
    """
    Custom permission to allow unauthenticated read-only access to public endpoints.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated
        
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

# Create your views here.

class WasteCategoryViewSet(viewsets.ModelViewSet):
    queryset = WasteCategory.objects.all()
    serializer_class = WasteCategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            # Allow any user (including unauthenticated) to read categories
            permission_classes = [AllowAnyReadOnly]
        return [permission() for permission in permission_classes]

class WasteTypeViewSet(viewsets.ModelViewSet):
    queryset = WasteType.objects.all()
    serializer_class = WasteTypeSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'potential_uses', 'category__name']
    ordering_fields = ['name', 'created_at', 'sustainability_score']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            # Allow any user (including unauthenticated) to read waste types
            permission_classes = [AllowAnyReadOnly]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return WasteTypeDetailSerializer
        return WasteTypeSerializer
    
    @action(detail=False)
    def by_category(self, request):
        category_id = request.query_params.get('category_id')
        if category_id:
            waste_types = WasteType.objects.filter(category_id=category_id)
            serializer = self.get_serializer(waste_types, many=True)
            return Response(serializer.data)
        return Response({"error": "Category ID is required"}, status=400)

class ResourceDocumentViewSet(viewsets.ModelViewSet):
    queryset = ResourceDocument.objects.all()
    serializer_class = ResourceDocumentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'author', 'description', 'waste_type__name']
    ordering_fields = ['title', 'publication_date', 'created_at']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            # Allow any user (including unauthenticated) to read documents
            permission_classes = [AllowAnyReadOnly]
        return [permission() for permission in permission_classes]
