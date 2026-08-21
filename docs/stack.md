# Recommended stack

**Decision status:** recommended default for v1. Agents and humans should follow this unless the owner explicitly picks an alternative from the table below.

## Verdict (what we should build with)

| Layer | Choice | Why |
| --- | --- | --- |
| UI framework | **Angular 22** (standalone, application builder) | Same family as the public CV; shared mental model and TypeScript patterns |
| Language / styles | **TypeScript** + **Sass** | Match portfolio; no Bootstrap unless product asks |
| Runtime (local/CI) | **Node.js >= 24.15** (`.nvmrc`) | Align with portfolio `engines` / toolchain |
| CMS | **Sanity** project `xm49cfca`, dataset `production` | Already live for the CV; schemas in portfolio `studio/` |
| Client reads | Sanity **CDN / query API** with public project config only | Same read model as the portfolio; no write token |
| Client writes | **Never direct** — HTTPS to our proxy only | Security contract |
| Auth | **Firebase Authentication** (email/password, single user) | Fits existing Firebase ecosystem; easy ID-token verify on Functions |
| Write proxy | **Firebase Cloud Functions** (2nd gen, Node 22/24) | **Only** place for `SANITY_WRITE_TOKEN`; verify ID token → Sanity Mutations |
| Admin hosting | **Firebase Hosting** (this app’s `dist/.../browser`) | Serves the **static** admin SPA only — same role as the CV host. **Does not** hold write secrets |
| Sanity SDK (server) | `@sanity/client` inside the proxy | Official mutations/patch API |
| Forms / UI state | Angular **Reactive Forms** + route guards | Enough for document CRUD; avoid heavy form libs in v1 |
| CI (initial) | GitHub Actions: `npm ci` + `npm run build` | Same gate policy as portfolio until real tests/lint exist |

```text
Browser (Angular admin)
  ├─ Firebase Auth (email/password)
  ├─ Sanity CDN read (projectId + dataset)
  └─ HTTPS → Cloud Function(s)
                 ├─ verify Firebase ID token
                 └─ @sanity/client + SANITY_WRITE_TOKEN → Mutations API
```

### Clarification: Firebase Hosting ≠ write tokens in the bundle

In the **portfolio** we forbade Sanity **write** tokens in the Angular client. That rule is about **what you put in the SPA**, not about which CDN hosts the SPA.

| Piece | What it is | May hold `SANITY_WRITE_TOKEN`? |
| --- | --- | --- |
| Firebase Hosting (CV or admin) | Static files (`index.html`, JS bundles) | **No** — anything here is public |
| Angular admin / CV `environment.ts` | Shipped to the browser | **No** write token |
| Cloud Functions (or Cloud Run / Worker) | Server code + secret env | **Yes** — only here |

So: **yes, admin hosting can be Firebase Hosting.** The CV warning was “don’t bake write credentials into the client bundle that Hosting serves,” not “don’t use Firebase Hosting.” Using Hosting for the admin UI and Functions for the proxy is “static site + small backend.” Hosting choice does not replace the proxy; Cloudflare Pages / Netlify are fine for the SPA **only if** mutations still go through a server that holds the token.

### Clarification: separate **repo** vs separate **deployable**

Could this admin have lived in `miguelgutierrezi.github.io` instead of `cv-admin-panel`?

| Arrangement | Allowed? | Notes |
| --- | --- | --- |
| **Same git repo**, second Angular app (e.g. `apps/cv` + `apps/admin`) + Functions in-repo | **Yes** | Monorepo is fine if builds stay isolated |
| **Same Hosting site / same SPA** as the public CV (routes like `/admin` inside the CV bundle) | **No (v1 contract)** | Mixes public site with editorial UI; easier to leak write paths into the CV client; brief forbids microfrontend-inside-CV |
| **Separate repo** (this project) | **Yes (chosen)** | Clearer handoff, separate CI/secrets surface, harder to accidentally ship admin code with the CV |

**Non-negotiable:** separate **deployable** (own build output + own Hosting target/URL) and write token only on the proxy.  
**Optional:** separate **git repository** — preferred for boundaries, not required for security.

We already chose a sibling repo (`cv-admin-panel`). Do not merge the admin into the CV SPA; if you ever monorepo, keep two apps and two deploy targets.
## What we should do (locked path)

1. **Keep Phase 0 docs** as the contract; treat this file as the stack lock for scaffold.
2. **Phase 1 — scaffold** ✓ Angular 22 in this repo on port **4300**, with public-safe `environment` (`sanity.*`, `proxyBaseUrl`, Firebase placeholders). Portfolio local `adminLoginUrl` → `http://localhost:4300`.
3. **Phase 2 — Auth** with Firebase email/password + `canActivate` guard on all editorial routes.
4. **Phase 3 — one (or few) Cloud Functions** e.g. `sanityMutate` / `sanityPatch` that:
   - reject missing/invalid ID tokens;
   - never echo the write token;
   - accept tightly shaped payloads (document type + patch), not arbitrary proxy-to-anywhere.
5. **Phase 4+** build screens against existing schemas only (`siteSettings`, `profile`, `project` first).
6. **Go-live:** Hosting URL → Sanity CORS → set portfolio `adminLoginUrl`.

Do **not** start with React/Next, a second CMS, Studio-as-primary-UI, or write tokens in `environment.ts`.

## Alternatives (only if explicitly chosen)

| Topic | Default | Acceptable alternative | Avoid in v1 |
| --- | --- | --- | --- |
| UI | Angular 22 | — | React/Next/Vue (splits stack with CV) |
| Auth | Firebase Auth email/password | Auth0 / Clerk single-user (extra vendor) | Multi-tenant IdP setup |
| Proxy | Cloud Functions 2nd gen | Cloud Run or Cloudflare Worker | Mutate from the browser |
| Hosting | Firebase Hosting (static admin SPA only) | Cloudflare Pages / Netlify | Putting write tokens in any SPA host’s bundle; embedding inside the CV repo deploy |
| CSS | Sass + simple tokens | Reuse CV tokens later if desired | Bootstrap-by-default / large UI kit before MVP |

## Public-safe vs secret config

**Allowed in Angular `environment` (browser):**

- `sanityProjectId`, `dataset`, `apiVersion`
- `proxyBaseUrl`
- Firebase web app config (apiKey, authDomain, …) — public by design

**Server / CI secrets only:**

- `SANITY_WRITE_TOKEN`
- Any service-account JSON used only for deploy or admin SDK (never shipped to the admin SPA)

## Package / tooling expectations (after scaffold)

- `@angular/*` ^22, RxJS 7, application builder
- `firebase` (client SDK) for Auth
- `firebase-tools` for Hosting + Functions deploy (local or CI)
- Functions: `firebase-functions`, `firebase-admin`, `@sanity/client`
- Primary validation: `npm run build` (admin app); deploy Functions separately

## Related

- [Architecture](./architecture.md)
- [Security](./security.md)
- [Roadmap](./roadmap.md)
- [Contract](./contract.md)
