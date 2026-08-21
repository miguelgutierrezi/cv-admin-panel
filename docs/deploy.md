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

## Required secret + IAM (Functions)

In this GitHub repo → **Settings → Secrets and variables → Actions**:

- `FIREBASE_SERVICE_ACCOUNT` — JSON of a Firebase/GCP service account on project `miguel-angel-gutierrez-ibague`.

You can reuse the **same** secret value already used by the portfolio repo (same Firebase project). Do **not** commit the JSON.

For **Hosting + Functions**, that service account needs more than Hosting Admin. Typical roles:

- Service Usage Consumer  
- Cloud Functions Admin (or Developer)  
- Artifact Registry Administrator  
- Cloud Build Editor  
- Secret Manager Secret Accessor  
- Service Account User  

Or project **Editor** for a personal CI account.

### Common CI errors

| Error | Meaning | Fix |
| --- | --- | --- |
| `403` on `artifactregistry` / `serviceusage` | SA lacks IAM | Add roles above |
| `500` on `serviceusage` / `cloudfunctions.googleapis.com` | Google flaky “ensure API” call | Re-run workflow; workflow retries Functions 3×. Hosting deploys first so the SPA still updates |

`sanityWrite` is already live from local deploy when CI flakes; re-run Actions after IAM is fixed.

## Manual deploy (local smoke)

```bash
nvm use
npm ci
npm run build
npm --prefix functions ci && npm --prefix functions run build
npx firebase-tools deploy --only hosting:admin,functions --project miguel-angel-gutierrez-ibague --force
```

## After first live deploy

1. Open https://cv-admin-panel.web.app → should redirect to `/login`.
2. Firebase Console → Authentication → Settings → **Authorized domains** → add `cv-admin-panel.web.app` (and custom domain later if any).
3. Optionally set portfolio prod `adminLoginUrl` to `https://cv-admin-panel.web.app` when ready (Phase 6).
4. Sanity CORS: add the admin origin when the admin reads the CDN from the browser.
5. Proxy smoke: login → **Probar proxy (ping)** (needs `SANITY_WRITE_TOKEN` secret + Functions).

## Related

- [proxy-setup.md](./proxy-setup.md)
- [stack.md](./stack.md)
- [auth-setup.md](./auth-setup.md)
- [roadmap.md](./roadmap.md)
