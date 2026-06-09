from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from .models import Sale
from .serializers import SaleSerializer, SaleCreateSerializer
from apps.users.permissions import IsBranchManager


class SaleListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['branch', 'status', 'customer']
    ordering_fields    = ['created_at', 'total']

    def get_serializer_class(self):
        return SaleCreateSerializer if self.request.method == 'POST' else SaleSerializer

    def get_queryset(self):
        user = self.request.user
        qs   = Sale.objects.select_related('branch', 'customer', 'sold_by').prefetch_related('items', 'payments')
        if user.role != 'OWNER':
            qs = qs.filter(branch=user.branch)
        # Date range filter
        date_from = self.request.query_params.get('date_from')
        date_to   = self.request.query_params.get('date_to')
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        return qs


class SaleDetailView(generics.RetrieveUpdateAPIView):
    serializer_class   = SaleSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        return Sale.objects.prefetch_related('items', 'payments')
