# Go-live (Phase 6)

Checklist to connect the public CV Login button to this admin and keep CDN reads working.

## URLs

| App | URL |
| --- | --- |
| Admin (prod) | https://cv-admin-panel.web.app |
| CV (prod) | https://miguel-angel-gutierrez-ibague.web.app |
| Admin (local) | http://localhost:4300 |
| CV (local) | http://localhost:4200 |

Portfolio prod sets `adminLoginUrl: 'https://cv-admin-panel.web.app'` in  
`miguelgutierrezi.github.io/src/environments/environment.prod.ts`. Redeploy the **CV** Hosting site for Login to appear in production.

## Sanity CORS (manual — Sanity Manage)

Project `xm49cfca` → **API** → **CORS origins**. Allow at least:

| Origin | Why |
| --- | --- |
| `http://localhost:4200` | CV local |
| `http://localhost:4300` | Admin local CDN reads |
| `https://miguel-angel-gutierrez-ibague.web.app` | CV prod |
| `https://cv-admin-panel.web.app` | Admin prod CDN reads |

Without the admin origins, list/forms in the admin fail CDN GET (403) even if writes via `sanityWrite` succeed.

## Firebase Auth authorized domains

Firebase Console → Authentication → Settings → **Authorized domains**:

- `localhost`
- `cv-admin-panel.web.app`
- `miguel-angel-gutierrez-ibague.web.app` (if any auth there later)

## Smoke checklist

1. Open CV prod → navbar **Login** → lands on admin login.
2. Sign in → **Probar proxy (ping)** OK.
3. Edit a project title → Guardar → refresh CV (or wait CDN) → change visible.
4. Unauthenticated callable write → rejected (auth required).

## Deploy reminders

- Admin: push `main` on this repo (or `npx firebase-tools deploy --only hosting:admin,functions`).
- CV: deploy portfolio after `adminLoginUrl` change (portfolio workflows / Hosting default site).
- Write token stays in Secret Manager (`SANITY_WRITE_TOKEN`), never in Angular env or GitHub Secrets.

## Related

- [deploy.md](./deploy.md)
- [proxy-setup.md](./proxy-setup.md)
- [security.md](./security.md)
- [contract.md](./contract.md) — integration checklist
