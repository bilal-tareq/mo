from django.contrib import admin
from .models import Supplier, PurchaseOrder, PurchaseOrderItem


class PurchaseOrderItemInline(admin.TabularInline):
    model  = PurchaseOrderItem
    extra  = 0
    fields = ('variant', 'quantity', 'unit_cost', 'total_cost')
    readonly_fields = ('total_cost',)


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display  = ('name', 'contact_person', 'phone', 'is_active')
    search_fields = ('name', 'phone')
    list_filter   = ('is_active',)


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'supplier', 'branch', 'status', 'total', 'created_at')
    list_filter  = ('status', 'branch')
    inlines      = [PurchaseOrderItemInline]
