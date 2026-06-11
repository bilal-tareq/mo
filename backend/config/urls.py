"""Root URL configuration."""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),

    # API v1
    path('api/v1/auth/',        include('apps.users.urls')),
    path('api/v1/branches/',    include('apps.branches.urls')),
    path('api/v1/products/',    include('apps.products.urls')),
    path('api/v1/inventory/',   include('apps.inventory.urls')),
    path('api/v1/sales/',       include('apps.sales.urls')),
    path('api/v1/customers/',   include('apps.customers.urls')),
    path('api/v1/reports/',     include('apps.reports.urls')),

    # ─── API Documentation (Swagger / ReDoc) ────────────────────────────────
    path('api/schema/',         SpectacularAPIView.as_view(),        name='schema'),
    path('api/docs/',           SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/',          SpectacularRedocView.as_view(url_name='schema'),   name='redoc'),
]

# Serve React Frontend
from django.http import HttpResponse
from django.template import TemplateDoesNotExist
from django.shortcuts import render

def frontend_fallback_view(request, path=''):
    try:
        return render(request, 'index.html')
    except TemplateDoesNotExist:
        return HttpResponse(
            "React frontend is not built yet. Run 'npm run build' in the frontend directory to compile assets.",
            status=200
        )

urlpatterns += [
    path('', frontend_fallback_view, name='index'),
    path('<path:path>', frontend_fallback_view),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
