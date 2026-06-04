from __future__ import annotations

from django.http import FileResponse, Http404
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Scan
from .pdf import render_scan_pdf
from .serializers import ScanSerializer


class _OwnedScanMixin:
    def get_queryset(self):
        return Scan.objects.select_related("domain").prefetch_related("results").filter(
            domain__owner=self.request.user,
        )


class ScanDetailView(_OwnedScanMixin, generics.RetrieveAPIView):
    serializer_class = ScanSerializer
    permission_classes = [permissions.IsAuthenticated]


class ScanReportView(_OwnedScanMixin, generics.RetrieveAPIView):
    """Same payload as ScanDetailView — kept distinct so clients can cache differently."""
    serializer_class = ScanSerializer
    permission_classes = [permissions.IsAuthenticated]


class ScanPdfView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk: int):
        try:
            scan = Scan.objects.select_related("domain").prefetch_related("results").get(
                pk=pk, domain__owner=request.user,
            )
        except Scan.DoesNotExist as exc:
            raise Http404 from exc
        pdf = render_scan_pdf(scan)
        response = FileResponse(pdf, content_type="application/pdf")
        response["Content-Disposition"] = (
            f'attachment; filename="posturescan-{scan.domain.hostname}-{scan.id}.pdf"'
        )
        return response


class ScanCompareView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            a_id = int(request.query_params["a"])
            b_id = int(request.query_params["b"])
        except (KeyError, ValueError):
            return Response({"detail": "query params 'a' and 'b' are required"}, status=400)

        scans = list(Scan.objects.select_related("domain").prefetch_related("results").filter(
            pk__in=(a_id, b_id), domain__owner=request.user,
        ))
        if len(scans) != 2:
            return Response({"detail": "scan not found"}, status=404)

        a, b = (scans[0], scans[1]) if scans[0].id == a_id else (scans[1], scans[0])

        def index(scan):
            return {(r.category, r.check_key): r for r in scan.results.all()}

        a_idx, b_idx = index(a), index(b)
        keys = set(a_idx) | set(b_idx)
        diff = []
        for key in sorted(keys):
            ra, rb = a_idx.get(key), b_idx.get(key)
            if ra and rb and (ra.status, ra.observed_value) == (rb.status, rb.observed_value):
                continue
            diff.append({
                "category": key[0],
                "check_key": key[1],
                "before": {
                    "status": ra.status if ra else None,
                    "observed_value": ra.observed_value if ra else None,
                },
                "after": {
                    "status": rb.status if rb else None,
                    "observed_value": rb.observed_value if rb else None,
                },
            })

        return Response({
            "a": ScanSerializer(a).data,
            "b": ScanSerializer(b).data,
            "score_delta": b.score - a.score,
            "diff": diff,
        })
