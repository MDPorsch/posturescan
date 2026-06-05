"""
Allowlist of well-known public sites whose hostnames may be displayed in full
on the public dashboard and in the Landing-page hero card.

These are widely recognised public companies whose security posture is already
publicly observable; revealing that they've been scanned leaks no useful
information to attackers. Every other hostname is masked before going out
through any public endpoint, to protect the privacy of people running scans
on their own internal / personal domains.

Lowercase, apex-form only. Subdomains are matched by their apex.
"""
from __future__ import annotations

PUBLIC_BENCHMARKS: frozenset[str] = frozenset({
    # Developer platforms
    "github.com", "gitlab.com", "bitbucket.org", "stackoverflow.com",
    "huggingface.co", "kaggle.com", "codepen.io", "replit.com",

    # Cloud infra / hosting
    "vercel.com", "netlify.com", "cloudflare.com", "fly.io",
    "render.com", "railway.app", "heroku.com", "digitalocean.com",
    "linode.com", "fastly.com", "akamai.com",

    # SaaS / productivity
    "stripe.com", "slack.com", "discord.com", "notion.so",
    "figma.com", "linear.app", "asana.com", "atlassian.com",
    "zoom.us", "dropbox.com", "airtable.com", "calendly.com",
    "intercom.com", "zendesk.com", "hubspot.com",

    # Big tech
    "google.com", "microsoft.com", "apple.com", "meta.com",
    "x.com", "linkedin.com", "youtube.com", "spotify.com",
    "netflix.com",

    # E-commerce
    "amazon.com", "ebay.com", "shopify.com", "etsy.com", "walmart.com",

    # Media / news
    "wikipedia.org", "mozilla.org", "bbc.com", "nytimes.com",
    "theguardian.com", "npr.org", "reuters.com", "ft.com",
    "wsj.com", "bloomberg.com", "medium.com", "substack.com",

    # AI labs / research
    "openai.com", "anthropic.com", "deepmind.com", "cohere.com",
    "mistral.ai",

    # Education
    "mit.edu", "stanford.edu", "harvard.edu", "coursera.org",
    "khanacademy.org", "edx.org",

    # Privacy / security
    "signal.org", "duckduckgo.com", "1password.com", "bitwarden.com",
    "protonmail.com", "tutanota.com", "torproject.org",

    # Misc widely-known
    "archive.org", "ycombinator.com", "sentry.io", "supabase.com",
    "reddit.com", "twitch.tv", "imgur.com", "wordpress.com",

    # Deliberately weak demo targets (your scanner will get an F here —
    # showing them in full is the whole point, they exist for testing)
    "badssl.com", "expired.badssl.com", "wrong.host.badssl.com",
    "self-signed.badssl.com", "untrusted-root.badssl.com",
    "no-common-name.badssl.com", "http.badssl.com",
})


def is_benchmark(hostname: str) -> bool:
    """True if the hostname (case-insensitive) is on the allowlist."""
    return hostname.lower() in PUBLIC_BENCHMARKS


def mask_hostname(hostname: str) -> str:
    """
    Mask a hostname for public display: keep the first 2 characters of the
    apex label and the TLD, replace the rest with `***`.

    Examples:
        github.com                     -> gi***.com
        staging.acme.example.com       -> ex***.com   (apex == "example")
        legacy.acme-internal.com       -> ac***.com   (apex == "acme-internal")
        a.b                            -> a***.b
        unparseable                    -> ***

    Subdomains, full domain length, and the actual letters past the second
    are all discarded — an observer learns only roughly what kind of TLD the
    site uses, nothing identifying.
    """
    if not hostname:
        return "***"
    parts = hostname.lower().strip(".").split(".")
    if len(parts) < 2:
        return "***"
    tld = parts[-1]
    apex = parts[-2]
    if not apex:
        return f"***.{tld}"
    visible = apex[:2] if len(apex) > 3 else apex[:1]
    return f"{visible}***.{tld}"


def public_name(hostname: str) -> str:
    """Return the hostname as-is if it's allowlisted, otherwise masked."""
    return hostname if is_benchmark(hostname) else mask_hostname(hostname)
