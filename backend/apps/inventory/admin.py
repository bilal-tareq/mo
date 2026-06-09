from django.contrib import admin
from .models import Stock, StockMovement, StockTransfer


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display  = ('branch', 'variant', 'quantity', 'min_quantity')
    list_filter   = ('branch',)
    search_fields = ('variant__sku', 'variant__product__name')


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ('stock', 'movement_type', 'quantity', 'created_by', 'created_at')
    list_filter  = ('movement_type',)


@admin.register(StockTransfer)
class StockTransferAdmin(admin.ModelAdmin):
    list_display = ('from_branch', 'to_branch', 'variant', 'quantity', 'status', 'created_at')
    list_filter  = ('status',)
