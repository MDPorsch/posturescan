from rest_framework import serializers

from .models import GuestCheckResult, GuestScan


class GuestCheckResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuestCheckResult
        fields = (
            "id", "category", "check_key", "status", "severity",
            "score_impact", "observed_value", "remediation", "detail",
        )


class GuestScanSerializer(serializers.ModelSerializer):
    results = GuestCheckResultSerializer(many=True, read_only=True)

    class Meta:
        model = GuestScan
        fields = (
            "id", "hostname", "score", "grade", "status",
            "started_at", "finished_at", "error_message",
            "share_token", "created_at", "results",
        )
