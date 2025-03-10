from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'user_type', 'organization', 'bio', 'address', 
                 'phone_number', 'profile_image', 'country', 'created_at', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'profile']
        
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    user_type = serializers.CharField(required=True)
    
    class Meta:
        model = UserProfile
        fields = ['user_type', 'organization', 'bio', 'address', 'phone_number', 'profile_image', 'country']

class UserUpdateSerializer(serializers.ModelSerializer):
    profile = UserProfileUpdateSerializer()
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'profile']
        
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        
        if profile_data:
            profile = instance.profile
            profile.user_type = profile_data.get('user_type', profile.user_type)
            profile.organization = profile_data.get('organization', profile.organization)
            profile.bio = profile_data.get('bio', profile.bio)
            profile.address = profile_data.get('address', profile.address)
            profile.phone_number = profile_data.get('phone_number', profile.phone_number)
            profile.profile_image = profile_data.get('profile_image', profile.profile_image)
            profile.country = profile_data.get('country', profile.country)
            profile.save()
            
        return instance 