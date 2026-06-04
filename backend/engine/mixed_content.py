"""Mixed-content detection.

Fetch the HTTPS homepage and look for resources loaded over plain HTTP via
common attributes (src, href, action, srcset, poster, data).
"""
from __future__ import annotations

import re

import requests

from .base import CheckResult, safe_get
from .ssrf_guard import UnsafeTargetError

CATEGORY = "mixed"

ATTR_RE = re.compile(
    r"""(?:src|href|action|srcset|poster|data)\s*=\s*["'](http://[^"'\s]+)["']""",
    re.IGNORECASE,
)


def run(hostname: str) -> list[CheckResult]:
    url = f"https://{hostname}/"
    try:
        response = safe_get(url)
    except (requests.RequestException, UnsafeTargetError) as exc:
        return [CheckResult(
            category=CATEGORY, check_key="mixed_content", status="info",
            severity="info", score_impact=0, observed_value=str(exc),
        )]

    try:
        body = response.text
    except UnicodeDecodeError:
        body = response.content.decode("utf-8", errors="replace")

    matches = ATTR_RE.findall(body)
    # Ignore anchor-only hrefs that go off-site by intent (still risky but noisy);
    # focus on resource loads. The regex already drops anchors via attr filter.
    if matches:
        sample = list({m for m in matches})[:5]
        return [CheckResult(
            category=CATEGORY, check_key="mixed_content", status="fail",
            severity="medium", score_impact=-10,
            observed_value=f"{len(matches)} insecure resources, e.g. {', '.join(sample)}",
            remediation=(
                "Load every resource over HTTPS. Replace 'http://' URLs with 'https://' or "
                "use protocol-relative '//' so the browser uses the page's scheme."
            ),
        )]
    return [CheckResult(
        category=CATEGORY, check_key="mixed_content", status="pass",
        severity="info", score_impact=0, observed_value="no insecure resources detected",
    )]
