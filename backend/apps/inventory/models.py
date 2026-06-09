from django.db import models


class Stock(models.Model):
    branch      = models.ForeignKey('branches.Branch', on_delete=models.CASCADE, related_name='stocks')
    variant     = models.ForeignKey('products.ProductVariant', on_delete=models.CASCADE, related_name='stocks')
    quantity    = models.IntegerField(default=0)
    min_quantity = models.IntegerField(default=5, help_text='Low-stock threshold')
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('branch', 'variant')
        ordering = ['branch', 'variant']

    def __str__(self):
        return f'{self.variant} @ {self.branch} — qty: {self.quantity}'

    @property
    def is_low_stock(self):
        return self.quantity <= self.min_quantity


class StockMovement(models.Model):
    class MovementType(models.TextChoices):
        IN         = 'IN',         'Stock In'
        OUT        = 'OUT',        'Stock Out'
        ADJUSTMENT = 'ADJUSTMENT', 'Adjustment'
        TRANSFER   = 'TRANSFER',   'Transfer'

    stock         = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=20, choices=MovementType.choices)
    quantity      = models.IntegerField()
    note          = models.TextField(blank=True)
    created_by    = models.ForeignKey(
        'users.CustomUser', on_delete=models.SET_NULL,
        null=True, related_name='stock_movements'
    )
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.movement_type} {self.quantity} — {self.stock}'


class StockTransfer(models.Model):
    class Status(models.TextChoices):
        PENDING  = 'PENDING',  'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    from_branch = models.ForeignKey('branches.Branch', on_delete=models.CASCADE, related_name='transfers_out')
    to_branch   = models.ForeignKey('branches.Branch', on_delete=models.CASCADE, related_name='transfers_in')
    variant     = models.ForeignKey('products.ProductVariant', on_delete=models.CASCADE)
    quantity    = models.IntegerField()
    status      = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    note        = models.TextField(blank=True)
    created_by  = models.ForeignKey(
        'users.CustomUser', on_delete=models.SET_NULL,
        null=True, related_name='transfers'
    )
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Transfer {self.from_branch} → {self.to_branch} | {self.variant} x{self.quantity}'
