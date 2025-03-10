from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WasteCategoryViewSet, WasteTypeViewSet, ResourceDocumentViewSet

router = DefaultRouter()
router.register('categories', WasteCategoryViewSet)
router.register('types', WasteTypeViewSet)
router.register('documents', ResourceDocumentViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 