"""HTTP version detection.

We approximate the negotiated HTTP version by inspecting the ALPN protocol
during the TLS handshake (h2 → HTTP/2, http/1.1 → HTTP/1.1, h3 not directly
visible over TCP). HTTP/3 detection requires UDP/QUIC support; we mark it as
"unknown" rather than guessing.
"""
from __future__ import annotations

import socket
import ssl

from .base import CheckResult
from .ssrf_guard import resolve_safely

CATEGORY = "http"


def run(hostname: str) -> list[CheckResult]:
    resolve_safely(hostname)
    try:
        ctx = ssl.create_default_context()
        ctx.set_alpn_protocols(["h2", "http/1.1"])
        with socket.create_connection((hostname, 443), timeout=6.0) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as sslsock:
                negotiated = sslsock.selected_alpn_protocol() or "http/1.1"
    except (socket.gaierror, socket.timeout, ssl.SSLError, OSError) as exc:
        return [CheckResult(
            category=CATEGORY, check_key="http_version", status="info",
            severity="info", score_impact=0,
            observed_value=f"could not detect: {exc}",
        )]

    if negotiated == "h2":
        return [CheckResult(
            category=CATEGORY, check_key="http_version", status="pass",
            severity="info", score_impact=0, observed_value="HTTP/2",
        )]
    return [CheckResult(
        category=CATEGORY, check_key="http_version", status="warn",
        severity="low", score_impact=-5, observed_value=negotiated,
        remediation="Enable HTTP/2 on your web server / CDN. It improves performance and is widely supported.",
    )]
