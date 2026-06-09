from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    UserCreateSerializer,
    ChangePasswordSerializer,
)
from .permissions import IsOwner, IsBranchManager

User = get_user_model()


class LoginView(TokenObtainPairView):
    """POST /api/v1/auth/login/ — returns access + refresh tokens."""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """POST /api/v1/auth/logout/ — blacklists refresh token."""
    try:
        refresh_token = request.data['refresh']
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'detail': 'Successfully logged out.'})
    except Exception:
        return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/auth/profile/ — current user profile."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = request.user
    if not user.check_password(serializer.validated_data['old_password']):
        return Response({'old_password': 'Incorrect password.'}, status=400)
    user.set_password(serializer.validated_data['new_password'])
    user.save()
    return Response({'detail': 'Password changed successfully.'})


class UserListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/v1/auth/users/ — owner-only user management."""
    permission_classes = [IsOwner]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        return User.objects.select_related('branch').order_by('username')


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/v1/auth/users/<id>/"""
    serializer_class = UserSerializer
    permission_classes = [IsOwner]
    queryset = User.objects.select_related('branch')
