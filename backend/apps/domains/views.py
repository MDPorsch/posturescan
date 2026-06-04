from __future__ import annotations

import dns.exception
import dns.resolver
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.scans.models import Scan
from apps.scans.runner import execute
from apps.scans.serializers import ScanSerializer, ScanSummarySerializer
from engine.ssrf_guard import UnsafeTargetError, resolve_safely

from .models import Domain
from .serializers import DomainSerializer


class DomainListCreateView(generics.ListCreateAPIView):
    serializer_class = DomainSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Domain.objects.filter(owner=self.request.user).prefetch_related("scans")

    def perform_create(self, serializer):
        hostname = serializer.validated_data["hostname"].strip().lower()
        try:
            resolve_safely(hostname)
        except UnsafeTargetError as exc:
            raise ValidationError({"hostname": str(exc)}) from exc
        serializer.save(owner=self.request.user, hostname=hostname)


class DomainVerifyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk: int):
        try:
            domain = Domain.objects.get(pk=pk, owner=request.user)
        except Domain.DoesNotExist:
            return Response({"detail": "not found"}, status=404)

        expected = f"posturescan-verify={domain.verification_token}"
        if domain.verification_method == "dns_txt":
            try:
                answers = dns.resolver.resolve(domain.hostname, "TXT")
                values = [r.to_text().strip('"') for r in answers]
            except dns.exception.DNSException:
                values = []
            if expected in values:
                domain.is_verified = True
                domain.verified_at = timezone.now()
                domain.save(update_fields=["is_verified", "verified_at"])
                return Response(DomainSerializer(domain).data)
            return Response(
                {"detail": "TXT record not found", "expected": expected},
                status=400,
            )

        # well_known
        import requests
        try:
            r = requests.get(
                f"https://{domain.hostname}/.well-known/posturescan-verify.txt",
                timeout=6,
            )
            if r.status_code == 200 and domain.verification_token in r.text:
                domain.is_verified = True
                domain.verified_at = timezone.now()
                domain.save(update_fields=["is_verified", "verified_at"])
                return Response(DomainSerializer(domain).data)
        except requests.RequestException:
            pass
        return Response({"detail": "verification file not found"}, status=400)


class DomainScanView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk: int):
        try:
            domain = Domain.objects.get(pk=pk, owner=request.user)
        except Domain.DoesNotExist:
            return Response({"detail": "not found"}, status=404)

        scan = Scan.objects.create(domain=domain)
        execute(scan)  # synchronous; the spec calls for sync scanning
        domain.last_scanned_at = timezone.now()
        domain.save(update_fields=["last_scanned_at"])
        return Response(ScanSerializer(scan).data, status=status.HTTP_201_CREATED)


class DomainHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk: int):
        try:
            domain = Domain.objects.get(pk=pk, owner=request.user)
        except Domain.DoesNotExist:
            return Response({"detail": "not found"}, status=404)
        scans = domain.scans.order_by("-created_at")[:100]
        return Response(ScanSummarySerializer(scans, many=True).data)
