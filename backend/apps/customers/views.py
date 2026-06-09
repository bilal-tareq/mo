from rest_framework import generics, permissions
from rest_framework.filters import SearchFilter
from .models import Customer
from .serializers import CustomerSerializer
from apps.users.permissions import IsBranchManager


class CustomerListCreateView(generics.ListCreateAPIView):
    serializer_class   = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [SearchFilter]
    search_fields      = ['name', 'phone', 'email']

    def get_queryset(self):
        user = self.request.user
        qs   = Customer.objects.select_related('branch')
        if user.role != 'OWNER':
            qs = qs.filter(branch=user.branch)
        return qs


class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = CustomerSerializer
    permission_classes = [IsBranchManager]
    queryset           = Customer.objects.all()
