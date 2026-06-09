from rest_framework import generics, permissions
from rest_framework.filters import SearchFilter
from .models import Supplier, PurchaseOrder
from .serializers import SupplierSerializer, PurchaseOrderSerializer, PurchaseOrderCreateSerializer
from apps.users.permissions import IsBranchManager, IsOwner


class SupplierListCreateView(generics.ListCreateAPIView):
    queryset           = Supplier.objects.all()
    serializer_class   = SupplierSerializer
    permission_classes = [IsBranchManager]
    filter_backends    = [SearchFilter]
    search_fields      = ['name', 'contact_person', 'phone']


class SupplierDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Supplier.objects.all()
    serializer_class   = SupplierSerializer
    permission_classes = [IsBranchManager]


class PurchaseOrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsBranchManager]

    def get_serializer_class(self):
        return PurchaseOrderCreateSerializer if self.request.method == 'POST' else PurchaseOrderSerializer

    def get_queryset(self):
        user = self.request.user
        qs   = PurchaseOrder.objects.select_related('supplier', 'branch', 'created_by').prefetch_related('items')
        if user.role != 'OWNER':
            qs = qs.filter(branch=user.branch)
        return qs


class PurchaseOrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class   = PurchaseOrderSerializer
    permission_classes = [IsBranchManager]
    queryset           = PurchaseOrder.objects.prefetch_related('items')
