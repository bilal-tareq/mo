from django.urls import path
from . import views

urlpatterns = [
    path('',views.SupplierListCreateView.as_view(),name='supplier-list'),
    path('<int:pk>/',views.SupplierDetailView.as_view(),name='supplier-detail'),
    path('orders/',views.PurchaseOrderListCreateView.as_view(),name='po-list'),
    path('orders/<int:pk>/',views.PurchaseOrderDetailView.as_view(),name='po-detail'),
]
