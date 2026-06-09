from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Stock, StockMovement, StockTransfer
from .serializers import StockSerializer, StockMovementSerializer, StockTransferSerializer
from apps.users.permissions import IsBranchManager, IsOwner


class StockListView(generics.ListAPIView):
    """GET /api/v1/inventory/stock/ — filtered by branch for managers."""
    serializer_class   = StockSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend]
    filterset_fields   = ['branch', 'variant']

    def get_queryset(self):
        qs = Stock.objects.select_related('branch', 'variant', 'variant__product')
        user = self.request.user
        if user.role != 'OWNER':
            qs = qs.filter(branch=user.branch)
        low_stock = self.request.query_params.get('low_stock')
        if low_stock == 'true':
            from django.db.models import F
            qs = qs.filter(quantity__lte=F('min_quantity'))
        return qs


class StockMovementListCreateView(generics.ListCreateAPIView):
    serializer_class   = StockMovementSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        return StockMovement.objects.select_related('stock', 'created_by').order_by('-created_at')


class StockTransferListCreateView(generics.ListCreateAPIView):
    serializer_class   = StockTransferSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        user = self.request.user
        qs   = StockTransfer.objects.select_related('from_branch', 'to_branch', 'variant')
        if user.role != 'OWNER':
            qs = qs.filter(from_branch=user.branch) | qs.filter(to_branch=user.branch)
        return qs


class StockTransferDetailView(generics.RetrieveUpdateAPIView):
    """PATCH to approve/reject transfer — owner only."""
    serializer_class   = StockTransferSerializer
    permission_classes = [IsOwner]
    queryset           = StockTransfer.objects.all()
