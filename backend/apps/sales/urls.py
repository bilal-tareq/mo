from django.urls import path
from . import views

urlpatterns = [
    path('',views.SaleListCreateView.as_view(),name='sale-list'),
    path('<int:pk>/',views.SaleDetailView.as_view(),name='sale-detail'),
]
