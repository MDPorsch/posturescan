# PostureScan — frontend

React 18 + Vite + Tailwind, themed in deep slate + emerald green.

## Run locally

```bash
npm install
cp .env.example .env       # VITE_API_BASE_URL should point at the backend
npm run dev
```

Visits at `http://localhost:5173`.

## Layout

```
frontend/
├── src/
│   ├── pages/             ← route components
│   │   ├── Landing.jsx
│   │   ├── ScanResults.jsx
│   │   ├── PublicDashboard.jsx
│   │   ├── SharedReport.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── AppDashboard.jsx
│   │   ├── DomainDetail.jsx
│   │   └── ScanReport.jsx
│   ├── components/        ← reusable pieces
│   │   ├── Navbar.jsx
│   │   ├── ScanProgress.jsx   ← animated steps, lights up emerald
│   │   ├── GradeCard.jsx
│   │   ├── CheckResult.jsx
│   │   └── ScoreChart.jsx
│   ├── hooks/useAuth.jsx   ← AuthProvider + useAuth
│   ├── lib/grade.js        ← grade colors + category labels
│   ├── api/client.js       ← fetch wrapper + JWT refresh + endpoint helpers
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── tailwind.config.js     ← brand tokens
├── vite.config.js
└── package.json
```

## Theme

The palette is centralised in `tailwind.config.js`:

| Token            | Hex       | Use                       |
| ---------------- | --------- | ------------------------- |
| `slate.950`      | `#0B1219` | page background           |
| `slate.900`      | `#0F1A22` | card background           |
| `slate.850`      | `#111F18` | input background          |
| `emerald.500`    | `#10B981` | primary accent            |
| `emerald.50`     | `#F0FDF4` | body text                 |
| `border.subtle`  | `#1A3022` | hairline borders          |
| `emerald.900`    | `#1E3A2A` | muted surfaces            |

Typography: **Manrope** (display) + **Inter Tight** (body) + **JetBrains Mono** (numeric / labels), loaded from Google Fonts in `index.html`.

## Deploy

Vercel is wired via the GitHub integration. Push to `main` → production; push to `staging` → preview. Set `VITE_API_BASE_URL` (and optionally `VITE_SENTRY_DSN`) in the Vercel project settings.
