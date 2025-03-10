from rest_framework import serializers
from .models import WasteCategory, WasteType, ResourceDocument

class ResourceDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceDocument
        fields = '__all__'

class WasteTypeSerializer(serializers.ModelSerializer):
    documents = ResourceDocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = WasteType
        fields = '__all__'

class WasteCategorySerializer(serializers.ModelSerializer):
    waste_types = WasteTypeSerializer(many=True, read_only=True)
    
    class Meta:
        model = WasteCategory
        fields = '__all__'

class WasteTypeDetailSerializer(serializers.ModelSerializer):
    documents = ResourceDocumentSerializer(many=True, read_only=True)
    category = WasteCategorySerializer(read_only=True)
    
    class Meta:
        model = WasteType
        fields = '__all__' 