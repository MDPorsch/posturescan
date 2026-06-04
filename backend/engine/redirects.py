"""Open redirect probing.

We look for the classic pattern: a query parameter named like `next`, `url`,
`redirect`, `return`, `target` that the server uses verbatim in a Location
header. We don't actually follow it — we just verify the response status and
header.

This is intentionally conservative: confirming an open redirect for sure
requires deeper crawling. We mark possible findings as warnings, not failures.
"""
from __future__ import annotations

from urllib.parse import urljoin

import requests

from .base import CheckResult, safe_get
from .ssrf_guard import UnsafeTargetError

CATEGORY = "redirects"

PARAMS = ["next", "url", "redirect", "return", "return_to", "target", "destination", "continue"]
PROBE_TARGET = "https://example.org/posturescan-probe"


def run(hostname: str) -> list[CheckResult]:
    base = f"https://{hostname}/"

    # First fetch the homepage so we have a believable referer / cookie context.
    try:
        safe_get(base)
    except (requests.RequestException, UnsafeTargetError):
        return [CheckResult(
            category=CATEGORY,
            check_key="open_redirect",
            status="info",
            severity="info",
            score_impact=0,
            observed_value="homepage unreachable, skipping probe",
        )]

    suspicious: list[str] = []
    for param in PARAMS:
        probe_url = urljoin(base, f"/?{param}={PROBE_TARGET}")
        try:
            r = safe_get(probe_url, allow_redirects=False)
        except (requests.RequestException, UnsafeTargetError):
            continue
        location = r.headers.get("Location", "")
        if 300 <= r.status_code < 400 and PROBE_TARGET in location:
            suspicious.append(f"{param} → {location}")

    if suspicious:
        return [CheckResult(
            category=CATEGORY,
            check_key="open_redirect",
            status="fail",
            severity="high",
            score_impact=-15,
            observed_value="; ".join(suspicious),
            remediation=(
                "Validate redirect targets against an allowlist of known internal paths/hosts. "
                "Never pass user-supplied URLs directly into a Location header."
            ),
        )]

    return [CheckResult(
        category=CATEGORY,
        check_key="open_redirect",
        status="pass",
        severity="info",
        score_impact=0,
        observed_value="no obvious open redirect on common parameters",
    )]
