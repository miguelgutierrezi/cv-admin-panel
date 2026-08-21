# CLAUDE.md

Guidance for Claude Code in this repository.

**Canonical agent guide:** see [AGENTS.md](AGENTS.md). Keep this file aligned with `AGENTS.md`, `.github/copilot-instructions.md`, and `.cursor/rules/` on every change.

## Context

Editorial admin for the Miguel Gutiérrez portfolio (Sanity writes). Sibling public CV: `../miguelgutierrezi.github.io/` (CDN read-only). **Phase 1 scaffold done** — `npm start` on port **4300**. Next: Phase 2 Auth ([docs/roadmap.md](docs/roadmap.md)).

## Read first

- [docs/contract.md](docs/contract.md)
- Portfolio [admin-app-brief.md](../miguelgutierrezi.github.io/docs/admin-app-brief.md)
- [docs/stack.md](docs/stack.md) — **recommended stack (locked for v1)**
- [docs/architecture.md](docs/architecture.md), [docs/security.md](docs/security.md)

## Recommended stack

- Angular 22 + TypeScript + Sass; Node >= 24.15
- Firebase Auth (email/password) + Cloud Functions write proxy (token **only** on Functions)
- Firebase Hosting for the **static** admin SPA — Hosting ≠ secrets; same rule as the CV (no write token in the browser bundle)
- Sanity `xm49cfca` / `production`; schemas in portfolio `studio/` only
- Details: [docs/stack.md](docs/stack.md)

## Hard rules

- No Sanity write tokens in the browser or in client env shipped to production builds.
- Separate deployable Angular admin + authenticated write proxy (Cloud Functions). Separate **repo** preferred; monorepo with two apps would also work — not the same as embedding admin in the CV SPA.
- Document CRUD only; schemas live in portfolio `studio/`.
- Follow `docs/stack.md` (do not default to React/Next).
- Single-author auth; no multi-tenant v1.
- Do not redesign or microfrontend the public portfolio.

## Sanity

- Project ID `xm49cfca`, dataset `production`
- Studio: https://miguel-gutierrez-cv.sanity.studio/
- MVP docs: `siteSettings`, `profile`, `project` (with `detail`); then `experience`, `course`, `navigation`

## Commands

- `npm start` → `http://localhost:4300/`
- `npm run build` — primary validation

## Agent documentation sync (mandatory)

Same change set must keep aligned: `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.cursor/rules/*.mdc`.
