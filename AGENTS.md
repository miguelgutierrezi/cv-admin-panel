# AGENTS.md

Guidance for any coding agent (Cursor, Claude Code, Copilot, etc.) working in `cv-admin-panel`.

## Context

Custom **editorial admin** for Miguel Gutiérrez’s portfolio CMS (Sanity). This repo is the **write** side. The public CV lives in the sibling folder `../miguelgutierrezi.github.io/` and stays **read-only** against the Sanity CDN.

Current repo state: **Phase 4 MVP screens done** (site / profile / projects). Next: Phase 5 slice 2. Sanity CORS may need admin origins (`localhost:4300`, `cv-admin-panel.web.app`).

## Contract (read first)

1. [docs/contract.md](docs/contract.md) — adapted handoff
2. [`../miguelgutierrezi.github.io/docs/admin-app-brief.md`](../miguelgutierrezi.github.io/docs/admin-app-brief.md) — canonical brief
3. Then: [docs/stack.md](docs/stack.md), [docs/architecture.md](docs/architecture.md), [docs/security.md](docs/security.md), [docs/roadmap.md](docs/roadmap.md)

Also skim portfolio `docs/cms-strategy.md` and `docs/architecture.md` when touching content shapes or integration.

## Recommended stack (v1 — locked)

See [docs/stack.md](docs/stack.md) for the full table. Default choices:

- **UI:** Angular 22 + TypeScript + Sass; Node **>= 24.15**
- **Auth:** Firebase Auth email/password (single user)
- **Hosting:** Firebase Hosting serves the **static** admin SPA only (same as the CV). It does **not** store write tokens. The portfolio rule was “no write token in the client bundle,” not “avoid Firebase Hosting.”
- **Proxy:** Firebase Cloud Functions 2nd gen + `@sanity/client` (write token server-only)
- **CMS:** Sanity `xm49cfca` / `production`; schemas only in portfolio `studio/`
- Do **not** scaffold React/Next or put write tokens in the client unless the owner overrides `docs/stack.md`.

## Non-negotiables

- Never put Sanity **write** tokens in client bundles, committed env files shipped to the browser, or README examples that look copy-pasteable as real secrets.
- Do not build a second CMS or redesign the public portfolio.
- Do not embed this admin as a microfrontend or `/admin` route inside the CV SPA (separate **deployable** is mandatory; separate **repo** is preferred, not the security core).
- Do not add multi-tenant / multi-author workflows in v1.
- Align field names with portfolio models (`portfolio.models.ts`) and schemas; `project.detail` is required.

## Commands

- `nvm use` → `npm install` → `npm start` — dev server at **`http://localhost:4300/`**
- `npm run build` — production build (**primary validation**)
- Deploy admin Hosting: `npx firebase-tools deploy --only hosting:admin` → https://cv-admin-panel.web.app
- CI/CD: `.github/workflows/` (ci, deploy, PR preview). Secret: `FIREBASE_SERVICE_ACCOUNT`. Details: `docs/deploy.md`
- Portfolio local Login → this app via `adminLoginUrl: 'http://localhost:4300'`
- Do not invent lint/test CI gates until a real suite exists (same policy as the portfolio).
- Do **not** run `npm test` as a routine gate unless the user asks.
## Working style

- Execute roadmap phases in order: docs → scaffold → auth ✓ → proxy ✓ → **MVP screens** → slice 2 → polish/go-live.
- Never put `SANITY_WRITE_TOKEN` in Angular env or GitHub Actions secrets; use `firebase functions:secrets:set`.
- Treat [docs/stack.md](docs/stack.md) as the default toolchain; do not silently switch stacks.
- Prefer surgical changes that match documented architecture.
- When changing content types, update portfolio schemas/studio first (or with the user); do not invent fields only in the admin.
- Before architectural changes, re-read `docs/`.

## Agent documentation sync (mandatory)

**Hard rule for every agent and every change:** in the **same** change set, keep these surfaces aligned:

1. `AGENTS.md` (this file)
2. `CLAUDE.md`
3. `.github/copilot-instructions.md`
4. `.cursor/rules/*.mdc`

A change that updates only application code or `docs/` without reviewing these is incomplete. For tiny edits, still review them; if none need updates, say so when finishing.

## Out of scope reminders

- Sanity schema editor UI
- Replacing the public Angular CV
- Module Federation with the portfolio
- Write tokens “just for local testing” in the Angular app
