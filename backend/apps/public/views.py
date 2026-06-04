from __future__ import annotations

from django.db.models import Avg, Count
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from apps.scans.runner import execute
from engine.ssrf_guard import UnsafeTargetError, resolve_safely

from .models import GuestCheckResult, GuestScan
from .serializers import GuestScanSerializer


def _client_ip(request) -> str | None:
    fwd = request.META.get("HTTP_X_FORWARDED_FOR")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


class GuestScanCreateView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        hostname = (request.data.get("hostname") or "").strip().lower()
        if not hostname:
            return Response({"detail": "hostname is required"}, status=400)

        # Strip a protocol prefix or trailing path if the user pasted a URL.
        for prefix in ("http://", "https://"):
            if hostname.startswith(prefix):
                hostname = hostname[len(prefix):]
        hostname = hostname.split("/", 1)[0]

        try:
            resolve_safely(hostname)
        except UnsafeTargetError as exc:
            return Response({"detail": str(exc)}, status=400)

        scan = GuestScan.objects.create(
            hostname=hostname,
            ip_address=_client_ip(request),
        )
        execute(scan)
        return Response(GuestScanSerializer(scan).data, status=201)


class GuestScanDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk: int):
        try:
            scan = GuestScan.objects.prefetch_related("results").get(pk=pk)
        except GuestScan.DoesNotExist:
            return Response({"detail": "not found"}, status=404)
        return Response(GuestScanSerializer(scan).data)


class SharedReportView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, token: str):
        try:
            scan = GuestScan.objects.prefetch_related("results").get(share_token=token)
        except GuestScan.DoesNotExist:
            return Response({"detail": "not found"}, status=404)
        return Response(GuestScanSerializer(scan).data)


class BadgeView(APIView):
    """Returns an SVG badge with the latest grade for a hostname."""
    permission_classes = [permissions.AllowAny]

    PALETTE = {
        "A": "#10B981",
        "B": "#34D399",
        "C": "#FBBF24",
        "D": "#F97316",
        "F": "#EF4444",
    }

    def get(self, request, hostname: str):
        scan = (
            GuestScan.objects
            .filter(hostname=hostname.lower(), status="completed")
            .order_by("-created_at")
            .first()
        )
        grade = scan.grade if scan else "?"
        score = scan.score if scan else 0
        color = self.PALETTE.get(grade, "#6B7280")
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="180" height="36" role="img" aria-label="PostureScan: {grade}">
  <rect width="120" height="36" fill="#0B1219"/>
  <rect x="120" width="60" height="36" fill="{color}"/>
  <g font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="12" fill="#F0FDF4">
    <text x="12" y="22">PostureScan</text>
    <text x="135" y="22" font-weight="bold" fill="#0B1219">{grade} · {score}</text>
  </g>
</svg>'''
        response = HttpResponse(svg, content_type="image/svg+xml")
        response["Cache-Control"] = "public, max-age=300"
        return response


class PublicDashboardView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        qs = GuestScan.objects.filter(status="completed")
        total = qs.count()
        if total == 0:
            return Response({
                "total_scans": 0,
                "average_score": 0,
                "grade_distribution": {g: 0 for g in "ABCDF"},
                "common_failures": [],
                "recent_scans": [],
            })

        agg = qs.aggregate(avg=Avg("score"))
        grades = dict(qs.values_list("grade").annotate(c=Count("id")))
        for g in "ABCDF":
            grades.setdefault(g, 0)

        failures = (
            GuestCheckResult.objects
            .filter(status="fail")
            .values("category", "check_key")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )

        recent = qs.order_by("-created_at")[:10].values(
            "id", "hostname", "score", "grade", "created_at",
        )

        return Response({
            "total_scans": total,
            "average_score": round(agg["avg"] or 0, 1),
            "grade_distribution": grades,
            "common_failures": list(failures),
            "recent_scans": list(recent),
        })
