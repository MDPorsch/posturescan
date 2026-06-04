"""TLS / SSL certificate and protocol checks."""
from __future__ import annotations

import socket
import ssl
from datetime import datetime, timezone

from .base import CheckResult
from .ssrf_guard import resolve_safely

CATEGORY = "tls"


def _connect(hostname: str, port: int = 443, timeout: float = 6.0):
    ctx = ssl.create_default_context()
    ctx.check_hostname = True
    ctx.verify_mode = ssl.CERT_REQUIRED
    sock = socket.create_connection((hostname, port), timeout=timeout)
    return ctx.wrap_socket(sock, server_hostname=hostname)


def run(hostname: str) -> list[CheckResult]:
    resolve_safely(hostname)
    results: list[CheckResult] = []

    # Certificate validity + expiry
    try:
        with _connect(hostname) as sslsock:
            cert = sslsock.getpeercert()
            protocol = sslsock.version() or ""
    except ssl.SSLCertVerificationError as exc:
        results.append(CheckResult(
            category=CATEGORY,
            check_key="cert_valid",
            status="fail",
            severity="critical",
            score_impact=-25,
            observed_value=str(exc),
            remediation=(
                "Install a valid certificate from a trusted CA (Let's Encrypt is free). "
                "Make sure the certificate matches the hostname and the full chain is served."
            ),
        ))
        return results
    except (socket.gaierror, socket.timeout, OSError) as exc:
        results.append(CheckResult(
            category=CATEGORY,
            check_key="tls_handshake",
            status="fail",
            severity="critical",
            score_impact=-25,
            observed_value=str(exc),
            remediation="Make sure the host accepts TLS connections on port 443.",
        ))
        return results

    results.append(CheckResult(
        category=CATEGORY,
        check_key="cert_valid",
        status="pass",
        severity="info",
        score_impact=0,
        observed_value="trusted chain, hostname matches",
    ))

    not_after = cert.get("notAfter")
    if not_after:
        expires = datetime.strptime(not_after, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
        days = (expires - datetime.now(timezone.utc)).days
        if days < 0:
            results.append(CheckResult(
                category=CATEGORY,
                check_key="cert_expiry",
                status="fail",
                severity="critical",
                score_impact=-20,
                observed_value=f"expired {-days} days ago",
                remediation="Renew the certificate immediately. Automate renewal with certbot or your platform's TLS manager.",
            ))
        elif days < 30:
            results.append(CheckResult(
                category=CATEGORY,
                check_key="cert_expiry",
                status="warn",
                severity="high",
                score_impact=-10,
                observed_value=f"expires in {days} days",
                remediation="Renew the certificate now and set up automatic renewal.",
            ))
        else:
            results.append(CheckResult(
                category=CATEGORY,
                check_key="cert_expiry",
                status="pass",
                severity="info",
                score_impact=0,
                observed_value=f"expires in {days} days",
            ))

    # Protocol version
    weak = {"TLSv1", "TLSv1.1", "SSLv3"}
    if protocol in weak:
        results.append(CheckResult(
            category=CATEGORY,
            check_key="protocol_version",
            status="fail",
            severity="high",
            score_impact=-15,
            observed_value=protocol,
            remediation="Disable TLS 1.0 and 1.1 on your web server. Require TLS 1.2 or higher.",
        ))
    else:
        results.append(CheckResult(
            category=CATEGORY,
            check_key="protocol_version",
            status="pass",
            severity="info",
            score_impact=0,
            observed_value=protocol or "TLS 1.2+",
        ))

    return results
