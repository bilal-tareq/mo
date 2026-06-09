from django.urls import path
from . import views

urlpatterns = [
    path('stock/',views.StockListView.as_view(),name='stock-list'),
    path('movements/',views.StockMovementListCreateView.as_view(),name='movement-list'),
    path('transfers/',views.StockTransferListCreateView.as_view(),name='transfer-list'),
    path('transfers/<int:pk>/',views.StockTransferDetailView.as_view(),name='transfer-detail'),
]
