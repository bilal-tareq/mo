from django.db.models import Sum, Count, Avg, F
from django.db.models.functions import TruncDate, TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.sales.models import Sale
from apps.inventory.models import Stock
from apps.customers.models import Customer
from apps.users.permissions import IsOwner, IsBranchManager


class DailySummaryView(APIView):
    """GET /api/v1/reports/daily/?date=YYYY-MM-DD&branch=<id>"""
    permission_classes = [IsBranchManager]

    def get(self, request):
        date   = request.query_params.get('date')
        branch = request.query_params.get('branch')

        qs = Sale.objects.filter(status='COMPLETED')
        if date:
            qs = qs.filter(created_at__date=date)
        if branch:
            qs = qs.filter(branch_id=branch)
        elif request.user.role != 'OWNER':
            qs = qs.filter(branch=request.user.branch)

        agg = qs.aggregate(
            total_revenue = Sum('total'),
            total_sales   = Count('id'),
            avg_sale      = Avg('total'),
        )
        return Response({
            'date':          date,
            'total_revenue': agg['total_revenue'] or 0,
            'total_sales':   agg['total_sales']   or 0,
            'avg_sale':      round(agg['avg_sale'] or 0, 2),
        })


class BranchComparisonView(APIView):
    """GET /api/v1/reports/branch-comparison/?month=YYYY-MM"""
    permission_classes = [IsOwner]

    def get(self, request):
        month = request.query_params.get('month')
        qs    = Sale.objects.filter(status='COMPLETED')
        if month:
            year, m = month.split('-')
            qs = qs.filter(created_at__year=year, created_at__month=m)

        data = (
            qs.values('branch__name')
              .annotate(revenue=Sum('total'), count=Count('id'))
              .order_by('-revenue')
        )
        return Response(list(data))


class SalesTrendView(APIView):
    """GET /api/v1/reports/sales-trend/?branch=<id>&period=daily|monthly"""
    permission_classes = [IsBranchManager]

    def get(self, request):
        period = request.query_params.get('period', 'daily')
        branch = request.query_params.get('branch')

        qs = Sale.objects.filter(status='COMPLETED')
        if branch:
            qs = qs.filter(branch_id=branch)
        elif request.user.role != 'OWNER':
            qs = qs.filter(branch=request.user.branch)

        trunc = TruncDate if period == 'daily' else TruncMonth
        data  = (
            qs.annotate(period=trunc('created_at'))
              .values('period')
              .annotate(revenue=Sum('total'), count=Count('id'))
              .order_by('period')
        )
        return Response(list(data))


class InventoryReportView(APIView):
    """GET /api/v1/reports/inventory/?branch=<id>"""
    permission_classes = [IsBranchManager]

    def get(self, request):
        branch = request.query_params.get('branch')
        qs     = Stock.objects.select_related('branch', 'variant', 'variant__product')
        if branch:
            qs = qs.filter(branch_id=branch)
        elif request.user.role != 'OWNER':
            qs = qs.filter(branch=request.user.branch)

        low_stock = qs.filter(quantity__lte=F('min_quantity'))
        total_value = qs.aggregate(
            value=Sum(F('quantity') * F('variant__cost_price'))
        )['value'] or 0

        return Response({
            'total_skus':        qs.count(),
            'low_stock_count':   low_stock.count(),
            'total_stock_value': round(total_value, 2),
            'low_stock_items': [
                {
                    'id':       s.id,
                    'branch':   s.branch.name,
                    'product':  s.variant.product.name,
                    'variant':  str(s.variant),
                    'quantity': s.quantity,
                    'min_qty':  s.min_quantity,
                }
                for s in low_stock[:50]
            ],
        })


class TopProductsView(APIView):
    """GET /api/v1/reports/top-products/?branch=<id>&limit=10"""
    permission_classes = [IsBranchManager]

    def get(self, request):
        branch = request.query_params.get('branch')
        limit  = int(request.query_params.get('limit', 10))

        from apps.sales.models import SaleItem
        qs = SaleItem.objects.select_related('variant__product', 'sale')
        if branch:
            qs = qs.filter(sale__branch_id=branch)
        elif request.user.role != 'OWNER':
            qs = qs.filter(sale__branch=request.user.branch)

        data = (
            qs.values('variant__product__name')
              .annotate(units_sold=Sum('quantity'), revenue=Sum('total_price'))
              .order_by('-units_sold')[:limit]
        )
        return Response(list(data))


class PowerBIEmbedInfoView(APIView):
    """GET /api/v1/reports/powerbi-embed/
    Fetches details required to embed a Power BI report using Service Principal auth.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.conf import settings
        import requests
        from msal import ConfidentialClientApplication

        tenant_id = settings.POWERBI_TENANT_ID
        client_id = settings.POWERBI_CLIENT_ID
        client_secret = settings.POWERBI_CLIENT_SECRET
        workspace_id = settings.POWERBI_WORKSPACE_ID
        report_id = settings.POWERBI_REPORT_ID

        # Verify configuration is provided
        if not all([tenant_id, client_id, client_secret, workspace_id, report_id]):
            return Response({
                "error": "Power BI settings are not fully configured in backend."
            }, status=500)

        # 1. Authenticate with Azure AD to get an access token for the Service Principal
        authority = f"https://login.microsoftonline.com/{tenant_id}"
        app = ConfidentialClientApplication(
            client_id,
            authority=authority,
            client_credential=client_secret
        )
        scopes = ["https://analysis.windows.net/powerbi/api/.default"]
        token_result = app.acquire_token_for_client(scopes=scopes)

        if "access_token" not in token_result:
            return Response({
                "error": "Failed to authenticate with Azure AD",
                "details": token_result.get("error_description", "Unknown error")
            }, status=400)

        access_token = token_result["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        # 2. Get report details (to obtain the correct embedUrl)
        report_url = f"https://api.powerbi.com/v1.0/myorg/groups/{workspace_id}/reports/{report_id}"
        try:
            report_response = requests.get(report_url, headers=headers, timeout=10)
        except requests.exceptions.RequestException as e:
            return Response({"error": "Failed to contact Power BI APIs", "details": str(e)}, status=502)

        if report_response.status_code != 200:
            return Response({
                "error": "Failed to fetch report details from Power BI",
                "details": report_response.text
            }, status=report_response.status_code)

        report_data = report_response.json()
        embed_url = report_data.get("embedUrl")

        # 3. Generate the Embed Token for this report and workspace
        token_url = f"https://api.powerbi.com/v1.0/myorg/groups/{workspace_id}/reports/{report_id}/GenerateToken"
        token_body = {"accessLevel": "View"}
        try:
            token_response = requests.post(token_url, json=token_body, headers=headers, timeout=10)
        except requests.exceptions.RequestException as e:
            return Response({"error": "Failed to contact Power BI token endpoint", "details": str(e)}, status=502)

        if token_response.status_code != 200:
            return Response({
                "error": "Failed to generate Embed Token from Power BI",
                "details": token_response.text
            }, status=token_response.status_code)

        embed_token = token_response.json().get("token")

        return Response({
            "reportId": report_id,
            "embedUrl": embed_url,
            "embedToken": embed_token
        })
