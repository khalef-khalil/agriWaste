from rest_framework import serializers
from .models import WasteListing, ListingImage, Order, Review, Message
from django.contrib.auth.models import User
from waste_catalog.serializers import WasteTypeSerializer
from users.serializers import UserSerializer

class ListingImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ListingImage
        fields = ['id', 'image', 'image_url', 'is_primary', 'created_at']
        
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class WasteListingSerializer(serializers.ModelSerializer):
    images = ListingImageSerializer(many=True, read_only=True)
    seller_username = serializers.SerializerMethodField()
    waste_type_name = serializers.SerializerMethodField()
    country_name = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()
    
    class Meta:
        model = WasteListing
        fields = '__all__'
        
    def get_seller_username(self, obj):
        return obj.seller.username
        
    def get_waste_type_name(self, obj):
        return obj.waste_type.name
        
    def get_country_name(self, obj):
        return dict(WasteListing.COUNTRY_CHOICES).get(obj.country, '')
        
    def get_is_active(self, obj):
        return obj.status == 'ACTIVE'

class WasteListingDetailSerializer(serializers.ModelSerializer):
    images = ListingImageSerializer(many=True, read_only=True)
    seller = UserSerializer(read_only=True)
    waste_type = WasteTypeSerializer(read_only=True)
    is_active = serializers.SerializerMethodField()
    
    class Meta:
        model = WasteListing
        fields = '__all__'
        
    def get_is_active(self, obj):
        return obj.status == 'ACTIVE'

class OrderSerializer(serializers.ModelSerializer):
    buyer_username = serializers.SerializerMethodField()
    listing_title = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = '__all__'
        
    def get_buyer_username(self, obj):
        return obj.buyer.username
        
    def get_listing_title(self, obj):
        return obj.listing.title

class OrderDetailSerializer(serializers.ModelSerializer):
    buyer = UserSerializer(read_only=True)
    listing = WasteListingSerializer(read_only=True)
    review = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = '__all__'
        
    def get_review(self, obj):
        try:
            if hasattr(obj, 'review'):
                return ReviewSerializer(obj.review).data
        except:
            pass
        return None

class ReviewSerializer(serializers.ModelSerializer):
    listing_id = serializers.PrimaryKeyRelatedField(source='listing', queryset=WasteListing.objects.all())
    reviewer_username = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = ['id', 'listing_id', 'rating', 'comment', 'created_at', 'reviewer_username']
        
    def get_reviewer_username(self, obj):
        return obj.reviewer.username
        
    def create(self, validated_data):
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.SerializerMethodField()
    receiver_username = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['sender']  # Make sender read-only since it's set from the authenticated user
        
    def get_sender_username(self, obj):
        return obj.sender.username
        
    def get_receiver_username(self, obj):
        return obj.receiver.username
        
    def validate_receiver(self, value):
        print(f"Validating receiver value: {value} (type: {type(value)})")  # Debug print
        try:
            # Handle different types of input
            if isinstance(value, User):
                receiver = value
            elif isinstance(value, dict) and 'id' in value:
                receiver = User.objects.get(id=int(value['id']))
            else:
                receiver = User.objects.get(id=int(value))
            
            print(f"Receiver validation passed: {receiver.username} (ID: {receiver.id})")
            return receiver  # Return the User instance instead of just the ID
        except (ValueError, TypeError, AttributeError) as e:
            print(f"Receiver validation failed - invalid format: {str(e)}")
            raise serializers.ValidationError(f"Invalid receiver ID format: {value}")
        except User.DoesNotExist:
            print(f"Receiver validation failed - user not found: ID {value}")
            raise serializers.ValidationError(f"User with ID {value} does not exist")
            
    def validate(self, data):
        print(f"Message serializer validate - Full data: {data}")  # Debug print
        
        # Get the current user from the context
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError({"sender": ["Authentication required."]})
            
        # Make sure receiver is not the sender
        if data.get('receiver') == request.user:  # Compare User instances
            raise serializers.ValidationError({"non_field_errors": ["You cannot send a message to yourself."]})
            
        return data
        
    def create(self, validated_data):
        # Set the sender to the current user
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data) 