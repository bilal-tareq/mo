from django.db import models


class Branch(models.Model):
    name       = models.CharField(max_length=120)
    address    = models.TextField(blank=True)
    phone      = models.CharField(max_length=30, blank=True)
    email      = models.EmailField(blank=True)
    is_active  = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Branch'
        verbose_name_plural = 'Branches'
        ordering = ['name']

    def __str__(self):
        return self.name


class BranchSettings(models.Model):
    branch       = models.OneToOneField(Branch, on_delete=models.CASCADE, related_name='settings')
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)
    tax_rate     = models.DecimalField(max_digits=5, decimal_places=2, default=14)  # percent
    currency     = models.CharField(max_length=10, default='EGP')
    notes        = models.TextField(blank=True)

    def __str__(self):
        return f'Settings — {self.branch.name}'
