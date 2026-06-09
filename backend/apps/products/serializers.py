from rest_framework import serializers
from .models import Category, Product, ProductVariant


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ['id', 'name', 'parent']


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProductVariant
        fields = ['id', 'size', 'color', 'sku', 'barcode', 'price', 'cost_price', 'is_active']


class ProductSerializer(serializers.ModelSerializer):
    variants     = ProductVariantSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model  = Product
        fields = ['id', 'name', 'category', 'category_name', 'description',
                  'image', 'is_active', 'created_at', 'variants']
        read_only_fields = ['id', 'created_at']


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Product
        fields = ['name', 'category', 'description', 'image', 'is_active']
