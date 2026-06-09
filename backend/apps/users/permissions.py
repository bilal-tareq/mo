from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """Allow access only to users with OWNER role."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated
                    and request.user.role == 'OWNER')


class IsBranchManager(BasePermission):
    """Allow access to BRANCH_MANAGER, CASHIER, and OWNER."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated
                    and request.user.role in ('OWNER', 'BRANCH_MANAGER', 'CASHIER'))


class IsSameBranch(BasePermission):
    """Allow access only if user belongs to the same branch as the object."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'OWNER':
            return True
        branch_id = getattr(obj, 'branch_id', None)
        return branch_id == request.user.branch_id
