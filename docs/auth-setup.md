# Auth setup (Phase 2)

Single-author Firebase Authentication for `cv-admin-panel`.

## Already done in code / Firebase project

- Firebase project: `miguel-angel-gutierrez-ibague` (same as portfolio Hosting)
- Web app **CV Admin Panel** created; public config lives in `src/environments/environment*.ts`
- Angular: login at `/login`, `authGuard` on `/`, logout on the home shell
- `AuthService.getIdToken()` ready for Phase 3 write proxy

Firebase **web apiKey is public by design**. Still never put Sanity write tokens in the client.

## Manual steps (Firebase Console)

1. Open [Firebase Console](https://console.firebase.google.com/) → project **miguel-angel-gutierrez-ibague**.
2. **Authentication** → **Get started** (if first time).
3. **Sign-in method** → enable **Email/Password** (not the passwordless email link unless you want it).
4. **Users** → **Add user** → create the single author email + password.
5. (Optional) set `allowedAdminEmail` in `environment.ts` / `environment.prod.ts` to that email so other Auth users cannot enter the admin UI.
6. **Authentication** → **Settings** → **Authorized domains**: keep `localhost` for local dev; add **`cv-admin-panel.web.app`** (and any custom domain) for production Hosting.

## Local smoke

```bash
# admin
cd cv-admin-panel && npm start   # http://localhost:4300 → redirects to /login

# portfolio (optional)
cd ../miguelgutierrezi.github.io && npm start  # Login → :4300
```

Sign in with the Console user → home shell → **Salir** returns to `/login`.

## Security notes

- Auth alone does not write to Sanity; Phase 3 proxy must verify the ID token server-side.
- Do not commit service-account JSON or write tokens.
- Prefer one user; leave multi-author out of scope for v1.

## Related

- [stack.md](./stack.md)
- [security.md](./security.md)
- [roadmap.md](./roadmap.md)
