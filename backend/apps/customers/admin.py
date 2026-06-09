from django.contrib import admin
from .models import Customer, LoyaltyTransaction


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display  = ('name', 'phone', 'branch', 'loyalty_points', 'total_purchases')
    search_fields = ('name', 'phone', 'email')
    list_filter   = ('branch',)


@admin.register(LoyaltyTransaction)
class LoyaltyTransactionAdmin(admin.ModelAdmin):
    list_display = ('customer', 'transaction_type', 'points', 'created_at')
