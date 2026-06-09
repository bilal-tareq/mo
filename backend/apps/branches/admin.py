from django.contrib import admin
from .models import Branch, BranchSettings


class BranchSettingsInline(admin.StackedInline):
    model = BranchSettings
    extra = 1


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'is_active', 'created_at')
    list_filter  = ('is_active',)
    inlines      = [BranchSettingsInline]
