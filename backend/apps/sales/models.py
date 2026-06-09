from django.db import models


class Sale(models.Model):
    class Status(models.TextChoices):
        PENDING   = 'PENDING',   'Pending'
        COMPLETED = 'COMPLETED', 'Completed'
        REFUNDED  = 'REFUNDED',  'Refunded'
        CANCELLED = 'CANCELLED', 'Cancelled'

    branch     = models.ForeignKey('branches.Branch', on_delete=models.CASCADE, related_name='sales')
    customer   = models.ForeignKey(
        'customers.Customer', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='sales'
    )
    sold_by    = models.ForeignKey(
        'users.CustomUser', on_delete=models.SET_NULL,
        null=True, related_name='sales'
    )
    status     = models.CharField(max_length=10, choices=Status.choices, default=Status.COMPLETED)
    subtotal   = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount   = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax        = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total      = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes      = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Sale #{self.pk} — {self.branch} — {self.total} EGP'


class SaleItem(models.Model):
    sale        = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    variant     = models.ForeignKey('products.ProductVariant', on_delete=models.PROTECT)
    quantity    = models.PositiveIntegerField()
    unit_price  = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    def save(self, *args, **kwargs):
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.variant} x{self.quantity}'


class Payment(models.Model):
    class Method(models.TextChoices):
        CASH    = 'CASH',    'Cash'
        CARD    = 'CARD',    'Card'
        DIGITAL = 'DIGITAL', 'Digital Wallet'

    sale   = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='payments')
    method = models.CharField(max_length=10, choices=Method.choices, default=Method.CASH)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f'{self.method} — {self.amount} EGP'
