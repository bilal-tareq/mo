from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display  = ('username', 'email', 'role', 'branch', 'is_active')
    list_filter   = ('role', 'is_active', 'branch')
    fieldsets = UserAdmin.fieldsets + (
        ('Role & Branch', {'fields': ('role', 'branch', 'phone', 'avatar')}),
    )
