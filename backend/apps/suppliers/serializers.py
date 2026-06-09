from rest_framework import serializers
from .models import Supplier, PurchaseOrder, PurchaseOrderItem


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Supplier
        fields = ['id', 'name', 'contact_person', 'phone', 'email', 'address', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    variant_name = serializers.CharField(source='variant.__str__', read_only=True)

    class Meta:
        model  = PurchaseOrderItem
        fields = ['id', 'variant', 'variant_name', 'quantity', 'unit_cost', 'total_cost']
        read_only_fields = ['total_cost']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    items          = PurchaseOrderItemSerializer(many=True, read_only=True)
    supplier_name  = serializers.CharField(source='supplier.name', read_only=True)
    branch_name    = serializers.CharField(source='branch.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model  = PurchaseOrder
        fields = ['id', 'supplier', 'supplier_name', 'branch', 'branch_name',
                  'status', 'total', 'notes', 'created_by', 'created_by_name',
                  'created_at', 'items']
        read_only_fields = ['id', 'created_by', 'created_at', 'total']


class PurchaseOrderCreateSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True)

    class Meta:
        model  = PurchaseOrder
        fields = ['supplier', 'branch', 'notes', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        validated_data['created_by'] = self.context['request'].user
        order = PurchaseOrder.objects.create(**validated_data)
        total = 0
        for item in items_data:
            poi = PurchaseOrderItem.objects.create(order=order, **item)
            total += poi.total_cost
        order.total = total
        order.save()
        return order
