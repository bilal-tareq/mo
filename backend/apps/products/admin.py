from django.contrib import admin
from .models import Category, Product, ProductVariant


class ProductVariantInline(admin.TabularInline):
    model  = ProductVariant
    extra  = 1
    fields = ('sku', 'barcode', 'size', 'color', 'price', 'cost_price', 'is_active')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent')
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display  = ('name', 'category', 'is_active', 'created_at')
    list_filter   = ('is_active', 'category')
    search_fields = ('name',)
    inlines       = [ProductVariantInline]


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display  = ('product', 'sku', 'barcode', 'size', 'color', 'price')
    search_fields = ('sku', 'barcode')
