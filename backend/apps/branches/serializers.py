from rest_framework import serializers
from .models import Branch, BranchSettings


class BranchSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model  = BranchSettings
        fields = ['tax_rate', 'currency', 'opening_time', 'closing_time', 'notes']


class BranchSerializer(serializers.ModelSerializer):
    settings = BranchSettingsSerializer(read_only=True)
    staff_count = serializers.IntegerField(source='users.count', read_only=True)

    class Meta:
        model  = Branch
        fields = ['id', 'name', 'address', 'phone', 'email', 'is_active',
                  'created_at', 'settings', 'staff_count']
        read_only_fields = ['id', 'created_at']
