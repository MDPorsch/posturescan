from rest_framework import serializers

from .models import CheckResult, Scan


class CheckResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckResult
        fields = (
            "id", "category", "check_key", "status", "severity",
            "score_impact", "observed_value", "remediation", "detail",
        )


class ScanSerializer(serializers.ModelSerializer):
    results = CheckResultSerializer(many=True, read_only=True)
    hostname = serializers.CharField(source="domain.hostname", read_only=True)

    class Meta:
        model = Scan
        fields = (
            "id", "hostname", "score", "grade", "status",
            "started_at", "finished_at", "error_message", "created_at",
            "results",
        )


class ScanSummarySerializer(serializers.ModelSerializer):
    hostname = serializers.CharField(source="domain.hostname", read_only=True)

    class Meta:
        model = Scan
        fields = ("id", "hostname", "score", "grade", "status", "created_at")
