# Copilot instructions

## Context

This repo is the **custom admin panel** for Miguel Gutiérrez’s portfolio CMS (Sanity). It is the authenticated **write** path. The public site is the sibling `miguelgutierrezi.github.io` and must remain CDN read-only with a local content fallback.

Repo status: Phase 6 done; login + home dashboard Figma done (`docs/ui.md`). Next: Phase 7 / editorial Figma when asked. Canonical agent entry: `AGENTS.md`.

## Recommended stack (v1)

- Angular 22 + TypeScript + Sass; Node >= 24.15
- Firebase Auth (email/password, single user)
- Firebase Cloud Functions 2nd gen + `@sanity/client` for writes (token server-only)
- Firebase Hosting for the **static** admin SPA only — does not hold write secrets (portfolio rule was about the client bundle, not about avoiding Hosting)
- Sanity `xm49cfca` / `production`; schemas only in portfolio `studio/`
- Do not default to React/Next or browser-side Sanity write tokens

## Product principles

- Separate admin **deployable**; not a microfrontend / `/admin` inside the CV SPA. Separate git repo is preferred (this repo); same-repo monorepo with two apps is OK if builds/hosts stay isolated — see `docs/stack.md`.
- Document CRUD only — schemas stay in the portfolio `studio/` package.
- Never expose Sanity write tokens in the Angular client.
- Follow `docs/stack.md` for tooling choices.
- UI: see `docs/ui.md` (login Figma dark; editorial light preferred).
- Align fields with portfolio models; `project.detail` is required.

## Architecture rules

- Client may know `projectId`, `dataset`, `apiVersion`, `proxyBaseUrl`, and Firebase web config only.
- All mutations go through Cloud Functions that verify Firebase ID tokens.
- Do not call Sanity Mutations from the browser with a write credential.
- Do not invent content types that are not in portfolio schemas.
- Consult `docs/stack.md`, `docs/contract.md`, `docs/architecture.md`, and `docs/security.md` before structural work.

## Security rules

- Secrets only on the Functions host / secret store.
- Auth gate before any write UI or mutate API.
- Configure Sanity CORS for admin (and portfolio) browser origins.
- Portfolio `adminLoginUrl` is set only when this admin is deployed.

## Delivery order

1. Docs bootstrap + stack lock ✓
2. Angular scaffold + port 4300 + public-safe env ✓
3. Firebase Auth ✓
4. Cloud Functions write proxy ✓
5. MVP screens: site, profile, projects ✓
6. Slice 2: experience, courses, navigation ← done
7. Polish / go-live ← done
8. Login Figma UI ← done (`docs/ui.md`)
9. Tests / lint → CI ← later
10. Editorial screens Figma ← when frames exist
7. Polish, deploy, CORS, portfolio Login URL (prod)
8. Later: real tests + lint → CI

## Commands

- `npm start` — `http://localhost:4300/`
- `npm run build` — primary validation
- Portfolio `environment.ts` already uses `adminLoginUrl: 'http://localhost:4300'`
- Deploy: Hosting target `admin` → https://cv-admin-panel.web.app; secret `FIREBASE_SERVICE_ACCOUNT`

## Agent documentation sync (mandatory)

**Hard rule:** keep these aligned in the same change set:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `.github/copilot-instructions.md`
4. `.cursor/rules/*.mdc`

## Working style

- Prefer surgical changes; do not redesign the public portfolio.
- Do not add premature lint/test CI gates before a real suite exists.
- After scaffold, validate with `npm run build` as the primary signal.
