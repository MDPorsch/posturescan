"""Tests for the SSRF guard."""
import pytest

from engine.ssrf_guard import UnsafeTargetError, is_safe_url, resolve_safely


@pytest.mark.parametrize("hostname", ["localhost", "127.0.0.1"])
def test_loopback_rejected(hostname):
    with pytest.raises(UnsafeTargetError):
        resolve_safely(hostname)


def test_invalid_hostname_rejected():
    with pytest.raises(UnsafeTargetError):
        resolve_safely("foo bar")


@pytest.mark.parametrize("url", [
    "ftp://example.com",
    "file:///etc/passwd",
    "javascript:alert(1)",
])
def test_unsafe_schemes_rejected(url):
    assert is_safe_url(url) is False


def test_metadata_ip_rejected():
    # Skip if DNS isn't resolvable in CI; the explicit ip check is what matters.
    with pytest.raises(UnsafeTargetError):
        resolve_safely("metadata.google.internal")
