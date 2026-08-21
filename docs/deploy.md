# Deploy (Firebase Hosting — admin site)

How this admin is deployed **without overwriting** the public CV.

## Firebase layout (same project, two sites)

| Site ID | URL | Repo |
| --- | --- | --- |
| `miguel-angel-gutierrez-ibague` (default) | https://miguel-angel-gutierrez-ibague.web.app | `miguelgutierrezi.github.io` (CV) |
| `cv-admin-panel` | https://cv-admin-panel.web.app | **this repo** |

Project: `miguel-angel-gutierrez-ibague`.  
Hosting target in this repo: **`admin`** → site `cv-admin-panel` (see `.firebaserc` + `firebase.json`).

```text
CV build  ──► Hosting site (default)     ← portfolio workflows
Admin build ──► Hosting site cv-admin-panel ← these workflows
```

## GitHub Actions

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `.github/workflows/ci.yml` | Push / PR to `main` | `npm ci` + `npm run build` (+ artifact) |
| `.github/workflows/deploy.yml` | Push to `main` + manual | Build + deploy **live** to `cv-admin-panel` |
| `.github/workflows/firebase-hosting-pull-request.yml` | PR to `main` | Build + **preview** channel (7d) |

## Required secret

In this GitHub repo → **Settings → Secrets and variables → Actions**:

- `FIREBASE_SERVICE_ACCOUNT` — JSON of a Firebase/GCP service account with Hosting Admin on project `miguel-angel-gutierrez-ibague`.

You can reuse the **same** secret value already used by the portfolio repo (same Firebase project). Do **not** commit the JSON.

Until the secret exists, CI build can pass but deploy/preview will fail.

## Manual deploy (local smoke)

```bash
nvm use
npm ci
npm run build
npx firebase-tools deploy --only hosting:admin --project miguel-angel-gutierrez-ibague
```

## After first live deploy

1. Open https://cv-admin-panel.web.app → should redirect to `/login`.
2. Firebase Console → Authentication → Settings → **Authorized domains** → add `cv-admin-panel.web.app` (and custom domain later if any).
3. Optionally set portfolio prod `adminLoginUrl` to `https://cv-admin-panel.web.app` when ready (Phase 6).
4. Sanity CORS: add the admin origin when the admin reads the CDN from the browser.

## What is not deployed yet

- Cloud Functions / Sanity write proxy (Phase 3)
- Lint/test gates (later)

## Related

- [stack.md](./stack.md)
- [auth-setup.md](./auth-setup.md)
- [roadmap.md](./roadmap.md)
