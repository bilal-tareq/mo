from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Category, Product, ProductVariant
from .serializers import CategorySerializer, ProductSerializer, ProductWriteSerializer, ProductVariantSerializer
from apps.users.permissions import IsBranchManager


class CategoryListCreateView(generics.ListCreateAPIView):
    queryset           = Category.objects.all()
    serializer_class   = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [SearchFilter]
    search_fields      = ['name']


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Category.objects.all()
    serializer_class   = CategorySerializer
    permission_classes = [IsBranchManager]


class ProductListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['category', 'is_active']
    search_fields      = ['name', 'description', 'variants__sku', 'variants__barcode']
    ordering_fields    = ['name', 'created_at']

    def get_serializer_class(self):
        return ProductWriteSerializer if self.request.method == 'POST' else ProductSerializer

    def get_queryset(self):
        return Product.objects.prefetch_related('variants').select_related('category')


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Product.objects.prefetch_related('variants').select_related('category')
    permission_classes = [IsBranchManager]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ProductWriteSerializer
        return ProductSerializer


class ProductVariantListCreateView(generics.ListCreateAPIView):
    serializer_class   = ProductVariantSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        return ProductVariant.objects.filter(product_id=self.kwargs['product_pk'])

    def perform_create(self, serializer):
        serializer.save(product_id=self.kwargs['product_pk'])


class ProductVariantDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = ProductVariantSerializer
    permission_classes = [IsBranchManager]

    def get_queryset(self):
        return ProductVariant.objects.filter(product_id=self.kwargs['product_pk'])
