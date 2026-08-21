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
| `https://cv-admin-panel.firebaseapp.com` | Admin prod (URL alternativa Firebase) |

Without the admin origins, list/forms in the admin fail CDN GET (403) even if writes via `sanityWrite` succeed.

### Mobile / LAN (CORS from phone)

CORS checks the **page origin** (scheme + host + port), not “desktop vs Android/iPhone”.

| How you open the admin on the phone | What to allow |
| --- | --- |
| Prod: `https://cv-admin-panel.web.app` | That exact origin in **Sanity CORS** (table above). Functions already allow it. |
| Local via Wi‑Fi IP: `http://192.168.x.x:4300` | That **exact** origin in Sanity CORS **and** in Cloud Functions `cors` (`functions/src/index.ts`), then redeploy functions. `localhost` alone does **not** cover the LAN IP. |
| Dev server | Serve with host reachable on LAN: `ng serve --host 0.0.0.0 --port 4300` (or `npm start` equivalent). |

**Quick check:** on the phone, open DevTools-remote / look at the failing request `Origin` header. That string must appear verbatim in Sanity Manage → CORS (and in Functions `cors` if the failure is on `sanityWrite` / callables).

Writes go through Firebase callables (auth + Functions CORS). Reads hit `*.apicdn.sanity.io` (Sanity CORS only). A phone can fail one or both depending on which call breaks.

## Firebase Auth authorized domains

Firebase Console → Authentication → Settings → **Authorized domains**:

- `localhost`
- `cv-admin-panel.web.app`
- `cv-admin-panel.firebaseapp.com`
- `miguel-angel-gutierrez-ibague.web.app` (if any auth there later)

LAN IPs are not Auth “domains”; Auth still uses `authDomain` (`*.firebaseapp.com`). Callable CORS is the usual blocker for LAN + writes.

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
