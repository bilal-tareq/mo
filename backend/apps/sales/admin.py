from django.contrib import admin
from .models import Sale, SaleItem, Payment


class SaleItemInline(admin.TabularInline):
    model  = SaleItem
    extra  = 0
    fields = ('variant', 'quantity', 'unit_price', 'total_price')
    readonly_fields = ('total_price',)


class PaymentInline(admin.TabularInline):
    model  = Payment
    extra  = 0


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display  = ('id', 'branch', 'customer', 'sold_by', 'total', 'status', 'created_at')
    list_filter   = ('status', 'branch')
    search_fields = ('id', 'customer__name')
    inlines       = [SaleItemInline, PaymentInline]
    readonly_fields = ('subtotal', 'total')
