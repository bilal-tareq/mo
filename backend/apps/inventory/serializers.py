from rest_framework import serializers
from .models import Stock, StockMovement, StockTransfer


class StockSerializer(serializers.ModelSerializer):
    variant_name  = serializers.CharField(source='variant.__str__', read_only=True)
    branch_name   = serializers.CharField(source='branch.name', read_only=True)
    is_low_stock  = serializers.BooleanField(read_only=True)

    class Meta:
        model  = Stock
        fields = ['id', 'branch', 'branch_name', 'variant', 'variant_name',
                  'quantity', 'min_quantity', 'is_low_stock', 'updated_at']


class StockMovementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model  = StockMovement
        fields = ['id', 'stock', 'movement_type', 'quantity', 'note',
                  'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class StockTransferSerializer(serializers.ModelSerializer):
    from_branch_name = serializers.CharField(source='from_branch.name', read_only=True)
    to_branch_name   = serializers.CharField(source='to_branch.name', read_only=True)

    class Meta:
        model  = StockTransfer
        fields = ['id', 'from_branch', 'from_branch_name', 'to_branch', 'to_branch_name',
                  'variant', 'quantity', 'status', 'note', 'created_by', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'status']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
