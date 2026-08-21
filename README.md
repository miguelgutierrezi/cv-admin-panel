# CV Admin Panel

Custom editorial UI for the Miguel Gutiérrez portfolio CMS (Sanity). This repo is the **write** side; the public CV stays read-only.

## Start here

Sibling portfolio (schemas, CDN adapter, local fallback):

`../miguelgutierrezi.github.io/`

**Contract / handoff (read first):**

1. [docs/contract.md](docs/contract.md) — adapted for this repo  
2. [`../miguelgutierrezi.github.io/docs/admin-app-brief.md`](../miguelgutierrezi.github.io/docs/admin-app-brief.md) — canonical brief  

**Plan de trabajo:** [docs/roadmap.md](docs/roadmap.md)  
**Stack:** [docs/stack.md](docs/stack.md)  
**Agent guidance:** [AGENTS.md](AGENTS.md)

## Current status

**Phase 1 scaffold — done** (Angular 22 shell on port **4300**). Next: Phase 2 Auth.

Portfolio local Login already points here: `adminLoginUrl: 'http://localhost:4300'` in the CV `environment.ts`.

## Local development

Use **Node.js >= 24.15** (see `.nvmrc`):

```bash
nvm use
npm install
npm start
```

Open `http://localhost:4300/`. The portfolio runs on `http://localhost:4200/` — use Login in the CV navbar to jump here.

| Command | Purpose |
| --- | --- |
| `npm start` | Dev server on **port 4300** |
| `npm run build` | Production build (**primary validation**) |
| `npm run watch` | Rebuild on change (development configuration) |

Do not put Sanity write tokens in `src/environments/`.

## Recommended stack (v1)

See **[docs/stack.md](docs/stack.md)**.

| Layer | Choice |
| --- | --- |
| UI | Angular 22 + TypeScript + Sass (Node >= 24.15) |
| Auth | Firebase Auth (email/password) — Phase 2 |
| Writes | Cloud Functions + `@sanity/client` — Phase 3 |
| Hosting | Firebase Hosting (static SPA; secrets on Functions) |
| CMS | Sanity `xm49cfca` / `production` |

## Rules of thumb

- No Sanity write tokens in the browser bundle
- Authenticated proxy for mutations
- Document CRUD only — schemas stay in the portfolio `studio/` package
- Separate deployable (this app), not `/admin` inside the CV SPA

## Documentation

| Doc | Purpose |
| --- | --- |
| [docs/stack.md](docs/stack.md) | Recommended stack |
| [docs/contract.md](docs/contract.md) | Non-negotiables, Sanity IDs |
| [docs/architecture.md](docs/architecture.md) | System shape |
| [docs/security.md](docs/security.md) | Tokens, auth, CORS |
| [docs/roadmap.md](docs/roadmap.md) | Phased delivery |

## Delivery phases (summary)

0. Docs bootstrap + stack lock ← **done**  
1. Angular scaffold + port 4300 + public-safe env ← **done**  
2. Firebase Auth ← **next**  
3. Cloud Functions write proxy  
4. MVP screens: site, profile, projects  
5. Slice 2: experience, courses, navigation  
6. Polish, deploy, CORS, prod `adminLoginUrl`  
7. Later: tests + lint → CI  

## Agent documentation sync

Keep aligned in the same change set: `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.cursor/rules/`.
