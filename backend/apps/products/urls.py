from django.urls import path
from . import views

urlpatterns = [
    path('categories/',views.CategoryListCreateView.as_view(),name='category-list'),
    path('categories/<int:pk>/',views.CategoryDetailView.as_view(),name='category-detail'),
    path('',views.ProductListCreateView.as_view(),name='product-list'),
    path('<int:pk>/',views.ProductDetailView.as_view(),name='product-detail'),
    path('<int:product_pk>/variants/',views.ProductVariantListCreateView.as_view(),name='variant-list'),
    path('<int:product_pk>/variants/<int:pk>/',views.ProductVariantDetailView.as_view(),name='variant-detail'),
]
