from rest_framework import generics, permissions
from .models import Branch
from .serializers import BranchSerializer
from apps.users.permissions import IsOwner, IsBranchManager


class BranchListCreateView(generics.ListCreateAPIView):
    """GET all branches (owner) or own branch (manager).  POST creates branch (owner only)."""
    serializer_class = BranchSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsOwner()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'OWNER':
            return Branch.objects.prefetch_related('users').order_by('name')
        return Branch.objects.filter(pk=user.branch_id)


class BranchDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE a single branch (owner only)."""
    serializer_class   = BranchSerializer
    permission_classes = [IsOwner]
    queryset           = Branch.objects.all()
