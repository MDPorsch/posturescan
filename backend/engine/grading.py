"""Score and grade computation, plus the top-level `run_scan()` orchestrator."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from .base import CheckResult
from . import cookies, dns_checks, headers, http_version, mixed_content, redirects, tls

MAX_SCORE = 100

# Order matters for the animated progress steps shown to the user.
PIPELINE: list[tuple[str, Callable[[str], list[CheckResult]]]] = [
    ("Checking TLS certificate", tls.run),
    ("Analysing HTTP headers", headers.run),
    ("Inspecting cookie flags", cookies.run),
    ("Probing for open redirects", redirects.run),
    ("Checking DNS records", dns_checks.run),
    ("Detecting HTTP version", http_version.run),
    ("Checking for mixed content", mixed_content.run),
]


@dataclass
class ScanOutput:
    score: int
    grade: str
    results: list[CheckResult]


def grade_for(score: int) -> str:
    if score >= 90:
        return "A"
    if score >= 80:
        return "B"
    if score >= 70:
        return "C"
    if score >= 60:
        return "D"
    return "F"


def score_from(results: list[CheckResult]) -> int:
    score = MAX_SCORE + sum(r.score_impact for r in results)
    return max(0, min(MAX_SCORE, score))


def run_scan(hostname: str) -> ScanOutput:
    """Run the full pipeline synchronously and return the aggregated result."""
    all_results: list[CheckResult] = []
    for _label, runner in PIPELINE:
        try:
            all_results.extend(runner(hostname))
        except Exception as exc:  # noqa: BLE001
            all_results.append(CheckResult(
                category=getattr(runner, "__module__", "engine").split(".")[-1],
                check_key="error",
                status="fail",
                severity="medium",
                score_impact=0,
                observed_value=f"{type(exc).__name__}: {exc}",
            ))
    score = score_from(all_results)
    return ScanOutput(score=score, grade=grade_for(score), results=all_results)
