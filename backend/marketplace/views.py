from django.shortcuts import render
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import WasteListing, ListingImage, Order, Review, Message
from .serializers import (
    WasteListingSerializer, 
    WasteListingDetailSerializer,
    ListingImageSerializer,
    OrderSerializer,
    OrderDetailSerializer,
    ReviewSerializer,
    MessageSerializer
)
from django.db.models import Q

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to the owner
        if hasattr(obj, 'seller'):
            return obj.seller == request.user
        elif hasattr(obj, 'buyer'):
            return obj.buyer == request.user
        elif hasattr(obj, 'sender'):
            return obj.sender == request.user
        return False

class AllowAnyReadOnly(permissions.BasePermission):
    """
    Custom permission to allow unauthenticated read-only access to public endpoints.
    """
    def has_permission(self, request, view):
        # Allow any read-only request (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True
        # Require authentication for other methods
        return request.user and request.user.is_authenticated
        
    def has_object_permission(self, request, view, obj):
        # Same as above - allow read-only for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Require authentication for other methods
        return request.user and request.user.is_authenticated

class WasteListingViewSet(viewsets.ModelViewSet):
    queryset = WasteListing.objects.all()
    serializer_class = WasteListingSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'location', 'waste_type__name']
    ordering_fields = ['price', 'created_at', 'available_from']
    
    def get_queryset(self):
        queryset = WasteListing.objects.select_related('seller', 'waste_type').all()
        
        # Filter by country if specified
        country = self.request.query_params.get('country', None)
        if country:
            queryset = queryset.filter(country=country)
            
        return queryset
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsOwnerOrReadOnly]
        elif self.action == 'create':
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['list', 'retrieve', 'active', 'by_country']:
            permission_classes = [AllowAnyReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return WasteListingDetailSerializer
        return WasteListingSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)
    
    @action(detail=False)
    def my_listings(self, request):
        listings = WasteListing.objects.select_related('waste_type').filter(seller=request.user)
        page = self.paginate_queryset(listings)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(listings, many=True)
        return Response(serializer.data)
    
    @action(detail=False)
    def active(self, request):
        queryset = WasteListing.objects.select_related('seller', 'waste_type').filter(status='ACTIVE')
        
        # Filter by country if specified
        country = self.request.query_params.get('country', None)
        if country:
            queryset = queryset.filter(country=country)
            
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False)
    def by_country(self, request):
        country = request.query_params.get('country', None)
        if not country:
            return Response({"error": "Country parameter is required"}, status=400)
            
        queryset = WasteListing.objects.select_related('seller', 'waste_type').filter(country=country, status='ACTIVE')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def upload_image(self, request, pk=None):
        listing = self.get_object()
        if listing.seller != request.user:
            return Response(
                {"detail": "You do not have permission to add images to this listing."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ListingImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(listing=listing)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'status']
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsOwnerOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        # Users can only see their own orders or orders for their listings
        user = self.request.user
        if user.is_staff:
            return Order.objects.select_related('buyer', 'listing', 'listing__seller', 'listing__waste_type').all()
        return Order.objects.select_related('buyer', 'listing', 'listing__seller', 'listing__waste_type').filter(
            Q(buyer=user) | Q(listing__seller=user)
        )
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OrderDetailSerializer
        return OrderSerializer
    
    def perform_create(self, serializer):
        listing = serializer.validated_data.get('listing')
        
        # Check if the listing is active
        if listing.status != 'ACTIVE':
            raise serializers.ValidationError("This listing is not active")
        
        # Check if the buyer isn't also the seller
        if listing.seller == self.request.user:
            raise serializers.ValidationError("You cannot place an order for your own listing")
        
        # Calculate total price
        quantity = serializer.validated_data.get('quantity')
        total_price = quantity * listing.price
        
        serializer.save(
            buyer=self.request.user,
            total_price=total_price
        )
    
    @action(detail=False)
    def my_orders(self, request):
        orders = Order.objects.select_related('listing', 'listing__waste_type').filter(buyer=request.user)
        page = self.paginate_queryset(orders)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=False)
    def my_sales(self, request):
        orders = Order.objects.select_related('buyer', 'listing').filter(listing__seller=request.user)
        page = self.paginate_queryset(orders)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        
        # Only the seller can update the status
        if order.listing.seller != request.user:
            return Response(
                {"detail": "Only the seller can update the order status"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        new_status = request.data.get('status')
        if not new_status:
            return Response(
                {"detail": "Status is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in [s[0] for s in Order.STATUS_CHOICES]:
            return Response(
                {"detail": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = new_status
        order.save()
        serializer = self.get_serializer(order)
        return Response(serializer.data)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsOwnerOrReadOnly]
        elif self.action == 'create':
            permission_classes = [permissions.IsAuthenticated]
        else:
            # Allow any user (including unauthenticated) to read reviews
            permission_classes = [AllowAnyReadOnly]
        return [permission() for permission in permission_classes]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
    def perform_create(self, serializer):
        serializer.save()

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsOwnerOrReadOnly]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        # Users can only see messages they've sent or received
        user = self.request.user
        return Message.objects.select_related('sender', 'receiver', 'listing').filter(
            Q(sender=user) | Q(receiver=user)
        )
    
    def perform_create(self, serializer):
        try:
            # Log the incoming data for debugging
            print(f"Message Creation - Request Data: {self.request.data}")
            print(f"Message Creation - Validated Data: {serializer.validated_data}")
            
            # Save the message with the current user as sender
            serializer.save(sender=self.request.user)
            print("Message Creation - Message saved successfully")
            
        except Exception as e:
            print(f"Message Creation - Error: {str(e)}")
            raise
    
    @action(detail=False)
    def my_messages(self, request):
        messages = Message.objects.select_related('sender', 'receiver', 'listing').filter(
            Q(sender=request.user) | Q(receiver=request.user)
        ).order_by('-created_at')
        
        page = self.paginate_queryset(messages)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=False)
    def unread(self, request):
        messages = Message.objects.select_related('sender', 'listing').filter(
            receiver=request.user,
            read=False
        ).order_by('-created_at')
        
        page = self.paginate_queryset(messages)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        message = self.get_object()
        
        # Only the receiver can mark a message as read
        if message.receiver != request.user:
            return Response(
                {"detail": "Only the receiver can mark a message as read"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message.read = True
        message.save()
        serializer = self.get_serializer(message)
        return Response(serializer.data)
