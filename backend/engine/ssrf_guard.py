"""
SSRF guard.

Every outbound request the engine makes flows through `resolve_safely()` first.
Rejects:
  - private / loopback / link-local / multicast / reserved addresses
  - the cloud metadata IP 169.254.169.254 explicitly
  - hostnames that cannot be resolved
  - schemes that are not http or https

Use `resolve_safely(hostname)` to validate before connecting and
`is_safe_url(url)` for full-URL checks (e.g. redirect followers).
"""
from __future__ import annotations

import ipaddress
import socket
from dataclasses import dataclass
from typing import Iterable
from urllib.parse import urlparse

ALLOWED_SCHEMES = {"http", "https"}
METADATA_IP = ipaddress.ip_address("169.254.169.254")


class UnsafeTargetError(ValueError):
    """Raised when a target host or URL is unsafe to scan."""


@dataclass(frozen=True)
class Resolved:
    hostname: str
    addresses: tuple[str, ...]


def _is_private(addr: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    if addr == METADATA_IP:
        return True
    return any((
        addr.is_private,
        addr.is_loopback,
        addr.is_link_local,
        addr.is_multicast,
        addr.is_reserved,
        addr.is_unspecified,
    ))


def _resolve(hostname: str) -> Iterable[str]:
    try:
        infos = socket.getaddrinfo(hostname, None)
    except socket.gaierror as exc:
        raise UnsafeTargetError(f"could not resolve {hostname}") from exc
    seen: set[str] = set()
    for info in infos:
        ip = info[4][0]
        if ip not in seen:
            seen.add(ip)
            yield ip


def resolve_safely(hostname: str) -> Resolved:
    """Resolve a hostname and reject if any address is private/reserved/metadata."""
    if not hostname or "/" in hostname or " " in hostname:
        raise UnsafeTargetError("invalid hostname")

    addresses: list[str] = []
    for ip_text in _resolve(hostname):
        try:
            addr = ipaddress.ip_address(ip_text)
        except ValueError as exc:
            raise UnsafeTargetError(f"invalid address resolved: {ip_text}") from exc
        if _is_private(addr):
            raise UnsafeTargetError(
                f"refusing to scan {hostname}: resolves to non-public address {ip_text}"
            )
        addresses.append(ip_text)

    if not addresses:
        raise UnsafeTargetError(f"{hostname} did not resolve to any address")
    return Resolved(hostname=hostname, addresses=tuple(addresses))


def is_safe_url(url: str) -> bool:
    """Check a full URL — scheme and resolved host — without raising."""
    try:
        parsed = urlparse(url)
    except ValueError:
        return False
    if parsed.scheme not in ALLOWED_SCHEMES:
        return False
    host = parsed.hostname
    if not host:
        return False
    try:
        resolve_safely(host)
    except UnsafeTargetError:
        return False
    return True
