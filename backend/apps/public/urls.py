from django.urls import path

from .views import (
    BadgeView,
    GuestScanCreateView,
    GuestScanDetailView,
    PublicDashboardView,
    SharedReportView,
)

urlpatterns = [
    path("scan/", GuestScanCreateView.as_view(), name="public-scan-create"),
    path("scan/<int:pk>/", GuestScanDetailView.as_view(), name="public-scan-detail"),
    path("report/<str:token>/", SharedReportView.as_view(), name="public-report"),
    path("badge/<str:hostname>/", BadgeView.as_view(), name="public-badge"),
    path("dashboard/", PublicDashboardView.as_view(), name="public-dashboard"),
]
