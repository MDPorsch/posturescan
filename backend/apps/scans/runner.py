"""Shared scan runner.

Used by both the authenticated `Scan` model (in this app) and the guest
`GuestScan` model (in `apps.public`). The runner takes any model instance that
exposes `.status`, `.score`, `.grade`, `.started_at`, `.finished_at`,
`.error_message`, plus a `results` reverse relation and a `hostname` field
(either directly or via `.domain.hostname`).
"""
from __future__ import annotations

from typing import Any

from django.db import transaction
from django.utils import timezone

from engine.grading import run_scan


def _hostname_of(obj: Any) -> str:
    if hasattr(obj, "domain") and obj.domain is not None:
        return obj.domain.hostname
    return obj.hostname  # GuestScan


def _result_model_for(obj: Any):
    """Return the CheckResult/GuestCheckResult model class for this scan."""
    return obj.results.model


def _link_field(obj: Any) -> str:
    """Return the FK field name on the result model pointing back at this scan."""
    return obj.results.field.name


def execute(scan_obj: Any) -> None:
    """Run the engine pipeline and persist results onto `scan_obj`."""
    scan_obj.status = "running"
    scan_obj.started_at = timezone.now()
    scan_obj.save(update_fields=["status", "started_at"])

    hostname = _hostname_of(scan_obj)
    result_model = _result_model_for(scan_obj)
    link = _link_field(scan_obj)

    try:
        output = run_scan(hostname)
    except Exception as exc:  # noqa: BLE001
        scan_obj.status = "failed"
        scan_obj.finished_at = timezone.now()
        scan_obj.error_message = f"{type(exc).__name__}: {exc}"
        scan_obj.save(update_fields=["status", "finished_at", "error_message"])
        return

    with transaction.atomic():
        rows = [
            result_model(
                **{link: scan_obj},
                category=r.category,
                check_key=r.check_key,
                status=r.status,
                severity=r.severity,
                score_impact=r.score_impact,
                observed_value=r.observed_value,
                remediation=r.remediation,
                detail=r.detail,
            )
            for r in output.results
        ]
        result_model.objects.bulk_create(rows)

        scan_obj.score = output.score
        scan_obj.grade = output.grade
        scan_obj.status = "completed"
        scan_obj.finished_at = timezone.now()
        scan_obj.save(update_fields=["score", "grade", "status", "finished_at"])
