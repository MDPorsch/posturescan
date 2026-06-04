# PostureScan — backend

Django 5 + DRF API and the synchronous scan engine.

## Run locally

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

## Layout

```
backend/
├── scanner/              ← project package (settings, urls, wsgi)
│   └── settings/         ← base.py + dev/staging/prod overrides
├── apps/
│   ├── accounts/         ← custom User model, JWT register/login/me
│   ├── domains/          ← user-owned tracked domains + verification
│   ├── scans/            ← Scan + CheckResult, runner, PDF, compare
│   └── public/           ← guest scans, dashboard, badge, share link
├── engine/               ← the scan engine itself
│   ├── ssrf_guard.py     ← MUST be called before any outbound request
│   ├── base.py           ← shared CheckResult dataclass + safe_get
│   ├── tls.py            ← cert + protocol checks
│   ├── headers.py        ← HSTS/CSP/XFO/XCTO/Referrer/Permissions
│   ├── cookies.py        ← Secure/HttpOnly/SameSite flags
│   ├── redirects.py      ← open-redirect probe on common params
│   ├── dns_checks.py     ← SPF/DMARC/CAA
│   ├── http_version.py   ← ALPN-based HTTP/2 detection
│   ├── mixed_content.py  ← http:// resources on the homepage
│   └── grading.py        ← orchestrator + score/grade math
├── tests/                ← pytest test suite
├── manage.py
├── Procfile              ← Railway start command
└── requirements.txt
```

## Run tests

```bash
pytest
```

The CI pipeline runs `pytest -q` against a real PostgreSQL service container.

## Adding a new check

1. Add or extend a module under `engine/`.
2. Append it to the `PIPELINE` list in `engine/grading.py` so it runs and shows up as a progress step in the UI.
3. Add a test under `tests/`.
