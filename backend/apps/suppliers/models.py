from django.db import models


class Supplier(models.Model):
    name           = models.CharField(max_length=150)
    contact_person = models.CharField(max_length=100, blank=True)
    phone          = models.CharField(max_length=30, blank=True)
    email          = models.EmailField(blank=True)
    address        = models.TextField(blank=True)
    is_active      = models.BooleanField(default=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class PurchaseOrder(models.Model):
    class Status(models.TextChoices):
        DRAFT    = 'DRAFT',    'Draft'
        SENT     = 'SENT',     'Sent to Supplier'
        RECEIVED = 'RECEIVED', 'Received'
        CANCELLED = 'CANCELLED', 'Cancelled'

    supplier   = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name='orders')
    branch     = models.ForeignKey('branches.Branch', on_delete=models.CASCADE, related_name='purchase_orders')
    status     = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    total      = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    notes      = models.TextField(blank=True)
    created_by = models.ForeignKey(
        'users.CustomUser', on_delete=models.SET_NULL,
        null=True, related_name='purchase_orders'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'PO#{self.pk} — {self.supplier} — {self.status}'


class PurchaseOrderItem(models.Model):
    order     = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    variant   = models.ForeignKey('products.ProductVariant', on_delete=models.PROTECT)
    quantity  = models.PositiveIntegerField()
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2)

    def save(self, *args, **kwargs):
        self.total_cost = self.unit_cost * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.variant} x{self.quantity}'
