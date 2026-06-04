from __future__ import annotations

import secrets

from django.db import models
from django.utils import timezone


def _token() -> str:
    return secrets.token_urlsafe(16)


class GuestScan(models.Model):
    hostname = models.CharField(max_length=253)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    score = models.IntegerField(default=0)
    grade = models.CharField(max_length=2, default="")
    status = models.CharField(max_length=20, default="queued")
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, default="")
    share_token = models.CharField(max_length=64, default=_token, unique=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("hostname",)),
            models.Index(fields=("-created_at",)),
            models.Index(fields=("ip_address", "-created_at")),
        ]


class GuestCheckResult(models.Model):
    guest_scan = models.ForeignKey(
        GuestScan, on_delete=models.CASCADE, related_name="results",
    )
    category = models.CharField(max_length=32)
    check_key = models.CharField(max_length=128)
    status = models.CharField(max_length=16)
    severity = models.CharField(max_length=16)
    score_impact = models.IntegerField(default=0)
    observed_value = models.TextField(blank=True, default="")
    remediation = models.TextField(blank=True, default="")
    detail = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
