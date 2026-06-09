from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """Extended user model with role-based access."""

    class Role(models.TextChoices):
        OWNER           = 'OWNER',          'Owner'
        BRANCH_MANAGER  = 'BRANCH_MANAGER', 'Branch Manager'
        CASHIER         = 'CASHIER',        'Cashier'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CASHIER,
    )
    branch = models.ForeignKey(
        'branches.Branch',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
    )
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f'{self.username} ({self.get_role_display()})'

    @property
    def is_owner(self):
        return self.role == self.Role.OWNER

    @property
    def is_branch_manager(self):
        return self.role == self.Role.BRANCH_MANAGER
