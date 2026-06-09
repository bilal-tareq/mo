from django.db import models


class Category(models.Model):
    name   = models.CharField(max_length=100)
    parent = models.ForeignKey(
        'self', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='children'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    name        = models.CharField(max_length=200)
    category    = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    description = models.TextField(blank=True)
    image       = models.ImageField(upload_to='products/', blank=True, null=True)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ProductVariant(models.Model):
    product     = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size        = models.CharField(max_length=20, blank=True)
    color       = models.CharField(max_length=50, blank=True)
    sku         = models.CharField(max_length=100, unique=True)
    barcode     = models.CharField(max_length=100, unique=True, blank=True)
    price       = models.DecimalField(max_digits=12, decimal_places=2)
    cost_price  = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active   = models.BooleanField(default=True)

    class Meta:
        ordering = ['product', 'size', 'color']

    def __str__(self):
        return f'{self.product.name} — {self.size}/{self.color} ({self.sku})'
