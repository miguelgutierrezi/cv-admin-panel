# Write proxy setup (Phase 3)

Cloud Function callable **`sanityWrite`** verifies Firebase Auth, then mutates Sanity with a **server-only** token.

## No Figma needed

Phase 3 is backend + a smoke button. Editorial UI screens are Phase 4+.

## Architecture

```text
Admin SPA (Auth session)
    → httpsCallable('sanityWrite')  [us-central1]
        → verify request.auth
        → @sanity/client + SANITY_WRITE_TOKEN
        → Sanity Mutations API
```

Allowed `_type` values: `siteSettings`, `profile`, `project`, `experience`, `course`, `navigation`.

Actions:

| `action` | Body | Effect |
| --- | --- | --- |
| `ping` | `{}` | Auth + token check (no write) |
| `patch` | `{ id, set?, unset? }` | Patch existing doc (type must be allowed) |
| `createOrReplace` | `{ document: { _id, _type, ... } }` | Upsert |
| `delete` | `{ id }` | Delete (type must be allowed) |

## One-time: Sanity write token

1. Sanity Manage → project `xm49cfca` → **API** → **Tokens** → Add API token  
2. Permissions: **Editor** (or sufficient to mutate `production`)  
3. Copy the token once (not into Angular `environment`)

## One-time: store secret in Firebase

```bash
cd cv-admin-panel
firebase functions:secrets:set SANITY_WRITE_TOKEN --project miguel-angel-gutierrez-ibague
# paste token when prompted
```

Requires **Blaze** (pay-as-you-go) on the Firebase project for Cloud Functions.

Optional server allow-list (same idea as client `allowedAdminEmail`):

```bash
# set as a regular param/env later if desired; client allow-list already exists
```

## Build & deploy functions

```bash
npm --prefix functions install
npm --prefix functions run build
firebase deploy --only functions --project miguel-angel-gutierrez-ibague
```

Or together with hosting:

```bash
npm run build
firebase deploy --only hosting:admin,functions --project miguel-angel-gutierrez-ibague
```

## Client

- `SanityProxyService.write(...)` → callable `sanityWrite`
- Home → **Probar proxy (ping)** after login
- Region: `environment.functionsRegion` = `us-central1`

## GitHub Actions

Deploy workflow should deploy functions after the secret exists in Secret Manager.  
`FIREBASE_SERVICE_ACCOUNT` (already used for Hosting) also deploys Functions; **do not** put `SANITY_WRITE_TOKEN` in GitHub — it lives in Google Secret Manager via `functions:secrets:set`.

## Related

- [security.md](./security.md)
- [deploy.md](./deploy.md)
- [auth-setup.md](./auth-setup.md)
- [roadmap.md](./roadmap.md)
