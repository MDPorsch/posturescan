"""HTTP security header analysis."""
from __future__ import annotations

import re

import requests

from .base import CheckResult, safe_get
from .ssrf_guard import UnsafeTargetError

CATEGORY = "headers"

# (check_key, header_name, severity, score_impact_if_missing, remediation)
HEADERS = [
    ("hsts", "Strict-Transport-Security", "high", -10,
     "Add: Strict-Transport-Security: max-age=31536000; includeSubDomains"),
    ("csp", "Content-Security-Policy", "high", -10,
     "Add a Content-Security-Policy header. Start with a report-only policy, then enforce."),
    ("x_frame_options", "X-Frame-Options", "medium", -10,
     "Add: X-Frame-Options: DENY (or use frame-ancestors in CSP)."),
    ("x_content_type_options", "X-Content-Type-Options", "medium", -10,
     "Add: X-Content-Type-Options: nosniff"),
    ("referrer_policy", "Referrer-Policy", "low", -5,
     "Add: Referrer-Policy: strict-origin-when-cross-origin"),
    ("permissions_policy", "Permissions-Policy", "low", -5,
     "Add a Permissions-Policy header restricting features you don't use (camera, microphone, geolocation, etc.)."),
]


def run(hostname: str) -> list[CheckResult]:
    url = f"https://{hostname}/"
    try:
        response = safe_get(url)
    except (requests.RequestException, UnsafeTargetError) as exc:
        return [CheckResult(
            category=CATEGORY,
            check_key="reachable",
            status="fail",
            severity="critical",
            score_impact=-10,
            observed_value=str(exc),
            remediation="Make sure the site responds over HTTPS on port 443.",
        )]

    results: list[CheckResult] = []
    headers = {k.lower(): v for k, v in response.headers.items()}

    for key, header, severity, impact, remediation in HEADERS:
        value = headers.get(header.lower())
        if not value:
            results.append(CheckResult(
                category=CATEGORY,
                check_key=key,
                status="fail",
                severity=severity,  # type: ignore[arg-type]
                score_impact=impact,
                observed_value="missing",
                remediation=remediation,
            ))
            continue

        # HSTS deeper check.
        if key == "hsts":
            match = re.search(r"max-age=(\d+)", value)
            max_age = int(match.group(1)) if match else 0
            if max_age < 15_552_000:  # 180 days
                results.append(CheckResult(
                    category=CATEGORY,
                    check_key=key,
                    status="warn",
                    severity="medium",
                    score_impact=-5,
                    observed_value=value,
                    remediation="Increase HSTS max-age to at least 15552000 (180 days) and include subdomains.",
                ))
                continue

        results.append(CheckResult(
            category=CATEGORY,
            check_key=key,
            status="pass",
            severity="info",
            score_impact=0,
            observed_value=value,
        ))

    return results
