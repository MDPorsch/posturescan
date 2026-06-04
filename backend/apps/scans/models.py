from __future__ import annotations

from django.db import models
from django.utils import timezone


class ScanStatus(models.TextChoices):
    QUEUED = "queued", "Queued"
    RUNNING = "running", "Running"
    COMPLETED = "completed", "Completed"
    FAILED = "failed", "Failed"


class Scan(models.Model):
    domain = models.ForeignKey(
        "domains.Domain", on_delete=models.CASCADE, related_name="scans",
    )
    score = models.IntegerField(default=0)
    grade = models.CharField(max_length=2, default="")
    status = models.CharField(
        max_length=20, choices=ScanStatus.choices, default=ScanStatus.QUEUED,
    )
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ("-created_at",)
        indexes = [models.Index(fields=("domain", "-created_at"))]

    def __str__(self) -> str:
        return f"Scan<{self.domain_id}@{self.created_at.isoformat()}>"


class CheckResult(models.Model):
    scan = models.ForeignKey(Scan, on_delete=models.CASCADE, related_name="results")
    category = models.CharField(max_length=32)
    check_key = models.CharField(max_length=128)
    status = models.CharField(max_length=16)
    severity = models.CharField(max_length=16)
    score_impact = models.IntegerField(default=0)
    observed_value = models.TextField(blank=True, default="")
    remediation = models.TextField(blank=True, default="")
    detail = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [
            models.Index(fields=("scan", "category")),
            models.Index(fields=("scan", "status")),
        ]
