from django.urls import path

from .views import ScanCompareView, ScanDetailView, ScanPdfView, ScanReportView

urlpatterns = [
    path("compare/", ScanCompareView.as_view(), name="scan-compare"),
    path("<int:pk>/", ScanDetailView.as_view(), name="scan-detail"),
    path("<int:pk>/report/", ScanReportView.as_view(), name="scan-report"),
    path("<int:pk>/pdf/", ScanPdfView.as_view(), name="scan-pdf"),
]
