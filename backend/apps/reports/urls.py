from django.urls import path
from . import views

urlpatterns = [
    path('daily/',views.DailySummaryView.as_view(),name='report-daily'),
    path('branch-comparison/',views.BranchComparisonView.as_view(),name='report-branches'),
    path('sales-trend/',views.SalesTrendView.as_view(),name='report-trend'),
    path('inventory/',views.InventoryReportView.as_view(),name='report-inventory'),
    path('top-products/',views.TopProductsView.as_view(),name='report-top-products'),
    path('powerbi-embed/', views.PowerBIEmbedInfoView.as_view(), name='report-powerbi-embed'),
]
