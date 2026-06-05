"""Tests for hostname masking on the public dashboard."""
import pytest

from apps.public.benchmarks import (
    PUBLIC_BENCHMARKS,
    is_benchmark,
    mask_hostname,
    public_name,
)


class TestMaskHostname:
    def test_simple_apex(self):
        assert mask_hostname("example.com") == "ex***.com"

    def test_well_known(self):
        # Just verifies the masking format, not the allowlist behaviour.
        assert mask_hostname("github.com") == "gi***.com"

    def test_subdomain_stripped(self):
        assert mask_hostname("staging.acme.example.com") == "ex***.com"

    def test_deep_subdomain(self):
        assert mask_hostname("a.b.c.d.example.io") == "ex***.io"

    def test_short_apex(self):
        # 3-letter apex shows only first character.
        assert mask_hostname("abc.com") == "a***.com"

    def test_two_letter_apex(self):
        assert mask_hostname("ab.io") == "a***.io"

    def test_uppercase_normalised(self):
        assert mask_hostname("GitHub.COM") == "gi***.com"

    def test_compound_tld_treated_as_one(self):
        # We don't try to be clever about .co.uk — apex is treated as the
        # second-to-last label ("co"). That's only 2 chars so the rule shows
        # one initial. Fine for privacy purposes — leaks no useful info.
        assert mask_hostname("example.co.uk") == "c***.uk"

    @pytest.mark.parametrize("bad", ["", "no-tld", ".", "..."])
    def test_unparseable(self, bad):
        result = mask_hostname(bad)
        assert "***" in result


class TestPublicName:
    def test_benchmark_returned_in_full(self):
        # github.com is in the allowlist
        assert "github.com" in PUBLIC_BENCHMARKS
        assert public_name("github.com") == "github.com"

    def test_non_benchmark_masked(self):
        result = public_name("acme-internal.example.com")
        assert result == "ex***.com"
        assert "acme" not in result
        assert "internal" not in result

    def test_benchmark_subdomain_masked(self):
        # "github.com" is allowlisted but "api.github.com" is not — masked.
        # This is intentional: only the apex is whitelisted.
        result = public_name("api.github.com")
        assert result == "gi***.com"

    def test_is_benchmark_case_insensitive(self):
        assert is_benchmark("GitHub.com") is True
        assert is_benchmark("github.com") is True
        assert is_benchmark("not-on-list.example") is False


class TestDashboardEndpoint:
    """Smoke test: the dashboard endpoint must not leak hostnames in
    `recent_scans` and must include them only in `recent_benchmarks`."""

    @pytest.mark.django_db
    def test_recent_scans_masked(self, api_client):
        from apps.public.models import GuestScan
        # An obviously private hostname that must not leak.
        GuestScan.objects.create(
            hostname="secret-staging.acme-corp.example.com",
            score=80, grade="B", status="completed",
        )
        # An allowlisted hostname that should appear in full in
        # recent_benchmarks.
        GuestScan.objects.create(
            hostname="github.com",
            score=95, grade="A", status="completed",
        )

        response = api_client.get("/api/public/dashboard/")
        assert response.status_code == 200
        data = response.json()

        recent = {row["hostname"] for row in data["recent_scans"]}
        assert "secret-staging.acme-corp.example.com" not in recent
        assert "acme-corp" not in str(recent)
        assert "ex***.com" in recent  # masked form of the private domain

        benchmarks = {row["hostname"] for row in data["recent_benchmarks"]}
        assert "github.com" in benchmarks
