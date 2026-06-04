# Contributing

## Workflow

1. Pull latest `staging`.
2. Make your change locally.
3. Run tests: `cd backend && pytest` and `cd frontend && npm run lint`.
4. Push directly to `staging`. CI runs tests then auto-deploys to Railway staging + Vercel preview.
5. When the change is verified on staging, push (or merge) to `main`. This deploys to production and creates a Sentry release.

No PRs are required. No branch protection. Move fast, but watch the CI run.

## Backend conventions

- Apps live under `backend/apps/`. Engine code lives under `backend/engine/`.
- Settings are split: `base`, `dev`, `staging`, `prod`. Never reference env vars outside settings.
- All scan logic must go through `engine/ssrf_guard.py` before any outbound network call.

## Frontend conventions

- Pages under `src/pages/`, components under `src/components/`, API calls under `src/api/`.
- Tailwind only — no extra CSS frameworks. Theme tokens are in `tailwind.config.js`.
- Use the central `api/client.js` for every request. Do not call `fetch` directly from a component.

## Adding a new check to the engine

1. Add a module under `backend/engine/` (or extend an existing one).
2. Append the check to `engine/grading.py` so it contributes to the score.
3. Add a fixture-based test in `backend/tests/`.
4. Update the score table in the blueprint.
