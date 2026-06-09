from rest_framework import serializers
from .models import Sale, SaleItem, Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Payment
        fields = ['id', 'method', 'amount']


class SaleItemSerializer(serializers.ModelSerializer):
    variant_name = serializers.CharField(source='variant.__str__', read_only=True)

    class Meta:
        model  = SaleItem
        fields = ['id', 'variant', 'variant_name', 'quantity', 'unit_price', 'total_price']


class SaleSerializer(serializers.ModelSerializer):
    items        = SaleItemSerializer(many=True, read_only=True)
    payments     = PaymentSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    sold_by_name  = serializers.CharField(source='sold_by.username', read_only=True)
    branch_name   = serializers.CharField(source='branch.name', read_only=True)

    class Meta:
        model  = Sale
        fields = ['id', 'branch', 'branch_name', 'customer', 'customer_name',
                  'sold_by', 'sold_by_name', 'status', 'subtotal', 'discount',
                  'tax', 'total', 'notes', 'created_at', 'items', 'payments']
        read_only_fields = ['id', 'sold_by', 'created_at']


class SaleCreateSerializer(serializers.ModelSerializer):
    items    = SaleItemSerializer(many=True)
    payments = PaymentSerializer(many=True)

    class Meta:
        model  = Sale
        fields = ['branch', 'customer', 'discount', 'tax', 'notes', 'items', 'payments']

    def create(self, validated_data):
        items_data    = validated_data.pop('items')
        payments_data = validated_data.pop('payments')
        validated_data['sold_by'] = self.context['request'].user

        # Calculate totals
        subtotal = sum(i['unit_price'] * i['quantity'] for i in items_data)
        discount = validated_data.get('discount', 0)
        tax      = validated_data.get('tax', 0)
        total    = subtotal - discount + tax

        sale = Sale.objects.create(
            subtotal=subtotal, total=total, **validated_data
        )
        for item in items_data:
            SaleItem.objects.create(sale=sale, **item)
        for payment in payments_data:
            Payment.objects.create(sale=sale, **payment)
        return sale
