from rest_framework import serializers
from .models import Customer, LoyaltyTransaction


class LoyaltyTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = LoyaltyTransaction
        fields = ['id', 'transaction_type', 'points', 'sale', 'note', 'created_at']


class CustomerSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)

    class Meta:
        model  = Customer
        fields = ['id', 'branch', 'branch_name', 'name', 'phone', 'email',
                  'loyalty_points', 'total_purchases', 'notes', 'created_at']
        read_only_fields = ['id', 'loyalty_points', 'total_purchases', 'created_at']
