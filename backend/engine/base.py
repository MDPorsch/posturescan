"""Shared types and helpers for engine modules."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

import requests
from django.conf import settings

from .ssrf_guard import UnsafeTargetError, is_safe_url, resolve_safely

Status = Literal["pass", "warn", "fail", "info"]
Severity = Literal["critical", "high", "medium", "low", "info"]


@dataclass
class CheckResult:
    category: str
    check_key: str
    status: Status
    severity: Severity
    score_impact: int  # negative number reduces score; 0 = pass
    observed_value: str = ""
    remediation: str = ""
    detail: dict[str, Any] = field(default_factory=dict)


def safe_get(
    url: str,
    *,
    allow_redirects: bool = True,
    timeout: float | None = None,
    max_redirects: int = 5,
) -> requests.Response:
    """
    Run an HTTP GET that is guarded against SSRF and bounded in size/time.

    Every redirect target is re-validated against the SSRF guard.
    Raises requests.RequestException for network errors and UnsafeTargetError
    for any blocked host.
    """
    if not is_safe_url(url):
        raise UnsafeTargetError(f"unsafe target: {url}")

    timeout = timeout or settings.SCAN_HTTP_TIMEOUT_SEC
    session = requests.Session()
    session.max_redirects = max_redirects

    # We follow manually so each hop is SSRF-checked.
    response = session.get(url, timeout=timeout, allow_redirects=False, stream=True)
    hops = 0
    while allow_redirects and 300 <= response.status_code < 400 and "location" in response.headers:
        if hops >= max_redirects:
            break
        next_url = requests.compat.urljoin(url, response.headers["location"])
        if not is_safe_url(next_url):
            raise UnsafeTargetError(f"redirect to unsafe target: {next_url}")
        url = next_url
        response.close()
        response = session.get(url, timeout=timeout, allow_redirects=False, stream=True)
        hops += 1

    # Bound size — read at most SCAN_MAX_RESPONSE_BYTES.
    cap = settings.SCAN_MAX_RESPONSE_BYTES
    body = b""
    for chunk in response.iter_content(chunk_size=16_384):
        body += chunk
        if len(body) >= cap:
            break
    response._content = body  # type: ignore[attr-defined]
    return response


__all__ = [
    "CheckResult",
    "Status",
    "Severity",
    "safe_get",
    "resolve_safely",
    "UnsafeTargetError",
]
