"""DNS health checks: SPF, DMARC, CAA."""
from __future__ import annotations

import dns.exception
import dns.resolver

from .base import CheckResult

CATEGORY = "dns"


def _query(name: str, record_type: str) -> list[str]:
    resolver = dns.resolver.Resolver()
    resolver.lifetime = 4.0
    resolver.timeout = 4.0
    try:
        answer = resolver.resolve(name, record_type)
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.exception.DNSException):
        return []
    return [r.to_text().strip('"') for r in answer]


def run(hostname: str) -> list[CheckResult]:
    results: list[CheckResult] = []

    # SPF — TXT record on the apex starting with v=spf1
    txts = _query(hostname, "TXT")
    spf = next((t for t in txts if t.lower().startswith("v=spf1")), None)
    if spf:
        results.append(CheckResult(
            category=CATEGORY, check_key="spf", status="pass", severity="info",
            score_impact=0, observed_value=spf,
        ))
    else:
        results.append(CheckResult(
            category=CATEGORY, check_key="spf", status="fail", severity="medium",
            score_impact=-10, observed_value="no SPF record",
            remediation='Add a TXT record at the apex: "v=spf1 -all" (or include your real senders).',
        ))

    # DMARC — TXT record at _dmarc.<host>
    dmarc_records = _query(f"_dmarc.{hostname}", "TXT")
    dmarc = next((t for t in dmarc_records if t.lower().startswith("v=dmarc1")), None)
    if dmarc:
        results.append(CheckResult(
            category=CATEGORY, check_key="dmarc", status="pass", severity="info",
            score_impact=0, observed_value=dmarc,
        ))
    else:
        results.append(CheckResult(
            category=CATEGORY, check_key="dmarc", status="fail", severity="medium",
            score_impact=-10, observed_value="no DMARC record",
            remediation=(
                f'Add a TXT record at _dmarc.{hostname} with: '
                '"v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com"'
            ),
        ))

    # CAA — at least one CAA record at the apex
    caa = _query(hostname, "CAA")
    if caa:
        results.append(CheckResult(
            category=CATEGORY, check_key="caa", status="pass", severity="info",
            score_impact=0, observed_value=", ".join(caa),
        ))
    else:
        results.append(CheckResult(
            category=CATEGORY, check_key="caa", status="warn", severity="low",
            score_impact=-5, observed_value="no CAA records",
            remediation='Add a CAA record listing the CA(s) allowed to issue certs, e.g. 0 issue "letsencrypt.org".',
        ))

    return results
