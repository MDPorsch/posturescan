from rest_framework import serializers

from .models import Domain


class DomainSerializer(serializers.ModelSerializer):
    latest_score = serializers.SerializerMethodField()
    latest_grade = serializers.SerializerMethodField()

    class Meta:
        model = Domain
        fields = (
            "id", "hostname", "is_verified", "verification_token",
            "verification_method", "verified_at", "last_scanned_at",
            "created_at", "latest_score", "latest_grade",
        )
        read_only_fields = (
            "id", "is_verified", "verification_token", "verified_at",
            "last_scanned_at", "created_at", "latest_score", "latest_grade",
        )

    def _latest(self, obj):
        return obj.scans.order_by("-created_at").first()

    def get_latest_score(self, obj):
        scan = self._latest(obj)
        return scan.score if scan else None

    def get_latest_grade(self, obj):
        scan = self._latest(obj)
        return scan.grade if scan else None
