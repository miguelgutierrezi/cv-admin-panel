# Architecture direction

## Principles

- Separate **read** (public CV) from **write** (this admin).
- Keep secrets on the server (write proxy); the Angular admin never holds a Sanity write token.
- Treat Sanity schemas in the portfolio `studio/` as the content-type source of truth.
- Prefer Angular (same major family as the portfolio) for the admin UI.
- Prefer precise, surgical changes over broad refactors.
- Do not redesign or embed the public portfolio.

## Target shape

```text
[Admin Angular UI]
        |
        |  session (Firebase Auth or equivalent)
        v
[Auth gate]
        |
        +--> read path: Sanity CDN / API (projectId + dataset public config)
        |
        +--> write path: HTTPS calls to Write Proxy (Bearer / cookie session)
                    |
                    v
            [Write proxy] --SANITY_WRITE_TOKEN--> Sanity Mutations / Patch API
```

Suggested folder boundaries once the app is scaffolded:

| Area | Responsibility |
| --- | --- |
| `src/app/models/` | Typed document shapes aligned with portfolio models / schemas |
| `src/app/auth/` | Login, session guard, auth service |
| `src/app/features/` | Screens: site, profile, projects, experience, courses, navigation |
| `src/app/api/` or `services/` | CDN reads + proxy write client (no tokens) |
| `src/environments/` | `sanityProjectId`, `dataset`, `apiVersion`, `proxyBaseUrl`, auth config |
| `functions/` or sibling backend | Authenticated proxy only (token lives here) |

Exact names can follow Angular CLI conventions; the hard boundary is **no write credentials in client code or env files shipped to the browser**.

## Content vs presentation

- Forms and lists edit **documents** of known types (`siteSettings`, `profile`, `project`, …).
- Do not generate or mutate Sanity schema definitions from the UI.
- Field names and localization (`{ es, en }`) must stay compatible with the portfolio adapter and `validatePortfolioContent` rules (especially `project.detail`).

## Relationship to the portfolio

| Concern | Portfolio | Admin |
| --- | --- | --- |
| Deployable | Firebase Hosting (static) | Separate hosting + proxy |
| Sanity access | CDN read | CDN/API read + mutations via proxy |
| Schemas | `studio/schemaTypes/` | Consumes existing types only |
| Login button | Redirect to `adminLoginUrl` | Owns auth UI |

## Recommended stack (locked for v1)

Full decision table and “what we should do”: **[stack.md](./stack.md)**.

Summary:

| Layer | Choice |
| --- | --- |
| UI | Angular 22 + TypeScript + Sass, Node >= 24.15 |
| Auth | Firebase Auth (email/password, single user) |
| Proxy | Firebase Cloud Functions 2nd gen + `@sanity/client` |
| Hosting | Firebase Hosting (admin SPA) |
| CMS | Sanity `xm49cfca` / `production` (schemas in portfolio `studio/`) |

Primary validation after scaffold: `npm run build` (same policy as the portfolio until a real test suite exists).

## Related docs

- [Stack](./stack.md)
- [Contract](./contract.md)
- [Security](./security.md)
- [Roadmap](./roadmap.md)
- Portfolio: `docs/architecture.md`, `docs/cms-strategy.md`, `docs/admin-app-brief.md`
