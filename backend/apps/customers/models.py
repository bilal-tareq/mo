from django.db import models


class Customer(models.Model):
    branch          = models.ForeignKey('branches.Branch', on_delete=models.CASCADE, related_name='customers')
    name            = models.CharField(max_length=150)
    phone           = models.CharField(max_length=30, unique=True)
    email           = models.EmailField(blank=True)
    loyalty_points  = models.IntegerField(default=0)
    total_purchases = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    created_at      = models.DateTimeField(auto_now_add=True)
    notes           = models.TextField(blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.phone})'


class LoyaltyTransaction(models.Model):
    class TransactionType(models.TextChoices):
        EARN   = 'EARN',   'Points Earned'
        REDEEM = 'REDEEM', 'Points Redeemed'

    customer         = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='loyalty_transactions')
    transaction_type = models.CharField(max_length=10, choices=TransactionType.choices)
    points           = models.IntegerField()
    sale             = models.ForeignKey(
        'sales.Sale', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='loyalty_transactions'
    )
    note       = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.transaction_type} {self.points} pts — {self.customer}'
