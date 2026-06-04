"""Cookie flag checks — Secure, HttpOnly, SameSite."""
from __future__ import annotations

import requests

from .base import CheckResult, safe_get
from .ssrf_guard import UnsafeTargetError

CATEGORY = "cookies"


def _parse_set_cookies(raw: list[str]) -> list[dict[str, str | bool]]:
    """Parse Set-Cookie headers into structured records."""
    cookies = []
    for header in raw:
        parts = [p.strip() for p in header.split(";") if p.strip()]
        if not parts:
            continue
        name = parts[0].split("=", 1)[0].strip()
        flags = {p.lower(): True if "=" not in p else p.split("=", 1)[1].strip().lower()
                 for p in parts[1:]}
        cookies.append({
            "name": name,
            "secure": "secure" in flags,
            "httponly": "httponly" in flags,
            "samesite": flags.get("samesite", ""),
            "raw": header,
        })
    return cookies


def run(hostname: str) -> list[CheckResult]:
    url = f"https://{hostname}/"
    try:
        response = safe_get(url)
    except (requests.RequestException, UnsafeTargetError) as exc:
        return [CheckResult(
            category=CATEGORY,
            check_key="reachable",
            status="info",
            severity="info",
            score_impact=0,
            observed_value=str(exc),
        )]

    # Use the raw list of Set-Cookie headers, not the merged single string.
    raw_cookies = response.raw.headers.getlist("Set-Cookie") if hasattr(response, "raw") else []
    if not raw_cookies:
        sc = response.headers.get("Set-Cookie")
        raw_cookies = [sc] if sc else []

    cookies = _parse_set_cookies(raw_cookies)
    if not cookies:
        return [CheckResult(
            category=CATEGORY,
            check_key="cookies_set",
            status="info",
            severity="info",
            score_impact=0,
            observed_value="no cookies set on response",
        )]

    results: list[CheckResult] = []
    for cookie in cookies:
        missing: list[str] = []
        impact = 0
        if not cookie["secure"]:
            missing.append("Secure")
            impact -= 10
        if not cookie["httponly"]:
            missing.append("HttpOnly")
            impact -= 10
        if not cookie["samesite"]:
            missing.append("SameSite")
            impact -= 5
        name = cookie["name"]
        if missing:
            results.append(CheckResult(
                category=CATEGORY,
                check_key=f"cookie:{name}",
                status="fail",
                severity="medium",
                score_impact=impact,
                observed_value=f"missing flags: {', '.join(missing)}",
                remediation=(
                    f"Set the cookie '{name}' with: Secure; HttpOnly; SameSite=Lax (or Strict). "
                    "If the cookie has to be JavaScript-readable, document why and remove HttpOnly explicitly."
                ),
            ))
        else:
            results.append(CheckResult(
                category=CATEGORY,
                check_key=f"cookie:{name}",
                status="pass",
                severity="info",
                score_impact=0,
                observed_value="Secure, HttpOnly, SameSite set",
            ))
    return results
