# PostureScan

A security posture scanner that grades any domain's external security across TLS, HTTP headers, cookies, redirects, and DNS health.

**Theme:** Deep slate + emerald green.
**Stack:** Django 5 + DRF · React 18 + Vite + Tailwind · Supabase PostgreSQL · Railway · Vercel · GitHub Actions · Sentry.

---

## Repository layout

```
posturescan/
├── .github/workflows/ci-cd.yml   ← test + deploy on push to staging/main
├── backend/                      ← Django + DRF API + scan engine
└── frontend/                     ← React + Vite + Tailwind UI
```

---

## Quick start (local development)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                 # then fill in DATABASE_URL etc.
python manage.py makemigrations      # only needed the first time, then commit
python manage.py migrate
python manage.py runserver
```

API runs at `http://localhost:8000`.

The first time you set the project up, run `makemigrations` once and commit the generated files under `backend/apps/*/migrations/` so deploys can apply them. CI also runs `makemigrations` as a safety step.

### Frontend

```bash
cd frontend
npm install                          # commit the generated package-lock.json
cp .env.example .env                 # set VITE_API_BASE_URL=http://localhost:8000
npm run dev
```

UI runs at `http://localhost:5173`.

---

## Branching model

Direct push only. No PRs, no protection rules.

| Branch    | Auto-deploys to                                |
| --------- | ---------------------------------------------- |
| `staging` | Railway staging + Vercel preview               |
| `main`    | Railway production + Vercel production + Sentry release |

Every push runs the test job. Deploy jobs only run on `staging` / `main`.

---

## Environment variables

### Backend (`backend/.env`)

```
DJANGO_SETTINGS_MODULE=scanner.settings.dev
SECRET_KEY=change-me
DEBUG=1
DATABASE_URL=postgres://user:pass@host:5432/dbname
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
JWT_ACCESS_LIFETIME_MIN=30
JWT_REFRESH_LIFETIME_DAYS=7
SENTRY_DSN=
SENTRY_ENVIRONMENT=dev
GUEST_SCAN_RATE_PER_HOUR=10
```

### Frontend (`frontend/.env`)

```
VITE_API_BASE_URL=http://localhost:8000
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=dev
```

---

## GitHub Actions secrets needed

| Name                          | Used in                                |
| ----------------------------- | -------------------------------------- |
| `RAILWAY_STAGING_DEPLOY_HOOK` | Staging deploy step                    |
| `RAILWAY_PROD_DEPLOY_HOOK`    | Production deploy step                 |
| `SENTRY_AUTH_TOKEN`           | Sentry release creation                |
| `SENTRY_ORG`                  | Sentry release creation                |
| `SENTRY_PROJECT`              | Sentry release creation                |

Vercel is wired separately via the Vercel GitHub integration — push to `main` → production, push to `staging` → preview.

---

## Documentation

- `CONTRIBUTING.md` — how to make changes
- `backend/README.md` — backend specifics
- `frontend/README.md` — frontend specifics
