# Admin contract (from portfolio handoff)

**Source of truth for product/security constraints:**  
[`../miguelgutierrezi.github.io/docs/admin-app-brief.md`](../../miguelgutierrezi.github.io/docs/admin-app-brief.md)

This file is the **adapted** contract for `cv-admin-panel`. If the brief and this file disagree, update this repo to match the brief (do not invent a second CMS).

## Workspace roles

| Path | Role |
| --- | --- |
| `miguelgutierrezi.github.io/` | Public Angular CV — **read-only** Sanity CDN |
| `cv-admin-panel/` (this repo) | Custom editorial UI + authenticated **write** path |

Portfolio Login redirects to `environment.adminLoginUrl` (empty in prod until this admin is deployed).

## Non-negotiables

1. **Never** put Sanity write tokens in the admin **or** portfolio client bundle.
2. Admin is a **separate deployable** (not a microfrontend / `/admin` route inside the CV SPA). A **separate git repo** (this one) is preferred for boundaries but a monorepo with two apps + two Hosting targets would also satisfy the security contract — see [stack.md](./stack.md).
3. **Content types are code-defined** in Sanity schemas under the portfolio `studio/`. This app does **CRUD of documents**, not runtime schema creation.
4. The public site keeps its **local fallback**; CMS outages must not empty the CV.
5. Prefer **Angular** for the admin UI (same stack as the portfolio) unless there is a strong reason not to.
6. Single-author auth is enough (e.g. Firebase Auth email/password) + **server-side write proxy**.

## System shape

```text
[Browser: Portfolio] --GET--> Sanity CDN (published)
[Browser: Admin UI]  --auth--> [Write proxy] --token--> Sanity Mutations API
                                      |
                                 secrets only here
```

Suggested proxy hosts: **Firebase Cloud Functions** (default — see [stack.md](./stack.md)); Cloud Run or Cloudflare Worker only if explicitly chosen. Portfolio stays on Firebase Hosting.

## Shared Sanity project

| Key | Value |
| --- | --- |
| Project ID | `xm49cfca` |
| Dataset | `production` |
| API version (portfolio) | `2025-01-01` |
| Studio (schemas UI) | https://miguel-gutierrez-cv.sanity.studio/ |
| Schema source of truth | `miguelgutierrezi.github.io/studio/schemaTypes/` |

CORS: every browser origin that calls Sanity (portfolio **and** admin, if the admin reads CDN directly) must be listed in Sanity Manage → API → CORS.

## Content types (MVP → later)

Align field names with portfolio schemas and `miguelgutierrezi.github.io/src/app/models/portfolio.models.ts`.

| Priority | Type | Notes |
| --- | --- | --- |
| MVP | Login / session | Required before any write |
| MVP | `siteSettings` | Singleton |
| MVP | `profile` | Singleton |
| MVP | `project` | List + form; **`detail` required** or portfolio mapper drops the doc |
| Done | `experience` | List + form; slug = stable id |
| Done | `course` | List + form; optional `credentialUrl` |
| Done | `navigation` | Singleton with `items[]` |
| Later | `ui` chrome labels | Still local in portfolio; migrate only if needed |

Localized fields are always `{ es, en }` (or localized string lists). Stable ids = Sanity `slug.current`.

Seed reference: `miguelgutierrezi.github.io/studio/seed/slice1-documents.md`, `slice2-documents.md`.

## Portfolio integration checklist (when admin ships)

1. Deploy admin (e.g. Firebase Hosting) — live at https://cv-admin-panel.web.app
2. Set portfolio `environment.prod.ts` → `adminLoginUrl` — **done** (`https://cv-admin-panel.web.app`); **redeploy CV**
3. Add admin origin (+ portfolio Firebase URL) to Sanity CORS — see [go-live.md](./go-live.md)
4. Smoke: Login from CV → admin; edit project title → publish → CV shows change via CDN
5. Keep Studio deploy optional for **schema** changes only

## Out of scope for v1

- Creating/editing Sanity **schemas** from this UI
- Multi-tenant / multi-author workflows
- Replacing the public Angular CV
- Microfrontends / Module Federation with the portfolio

## Related

- [Recommended stack](./stack.md)
- [Architecture](./architecture.md)
- [UI](./ui.md)
- [Security](./security.md)
- [Roadmap](./roadmap.md)
