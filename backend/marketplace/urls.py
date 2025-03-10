from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WasteListingViewSet, OrderViewSet, ReviewViewSet, MessageViewSet

router = DefaultRouter()
router.register('listings', WasteListingViewSet)
router.register('orders', OrderViewSet)
router.register('reviews', ReviewViewSet)
router.register('messages', MessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 