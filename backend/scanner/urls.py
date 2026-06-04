"""Root URL configuration for PostureScan."""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health(_request):
    return JsonResponse({"status": "ok", "service": "posturescan"})


urlpatterns = [
    path("", health, name="root"),
    path("healthz/", health, name="health"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/public/", include("apps.public.urls")),
    path("api/domains/", include("apps.domains.urls")),
    path("api/scans/", include("apps.scans.urls")),
]
