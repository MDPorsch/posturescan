from __future__ import annotations

import secrets

from django.conf import settings
from django.db import models
from django.utils import timezone


class VerificationMethod(models.TextChoices):
    DNS_TXT = "dns_txt", "DNS TXT"
    WELL_KNOWN = "well_known", "/.well-known file"


def _token() -> str:
    return secrets.token_urlsafe(24)


class Domain(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="domains",
    )
    hostname = models.CharField(max_length=253)
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=64, default=_token)
    verification_method = models.CharField(
        max_length=20, choices=VerificationMethod.choices,
        default=VerificationMethod.DNS_TXT,
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    last_scanned_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("owner", "hostname"), name="uniq_owner_hostname",
            ),
        ]
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return self.hostname
