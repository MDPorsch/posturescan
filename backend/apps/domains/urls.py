from django.urls import path

from .views import (
    DomainHistoryView,
    DomainListCreateView,
    DomainScanView,
    DomainVerifyView,
)

urlpatterns = [
    path("", DomainListCreateView.as_view(), name="domain-list"),
    path("<int:pk>/verify/", DomainVerifyView.as_view(), name="domain-verify"),
    path("<int:pk>/scan/", DomainScanView.as_view(), name="domain-scan"),
    path("<int:pk>/history/", DomainHistoryView.as_view(), name="domain-history"),
]
