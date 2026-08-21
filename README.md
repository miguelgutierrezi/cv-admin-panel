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

**Phase 6 polish + go-live — done**. Editorial Figma through **Navigation** (`66:362`) — [docs/ui.md](docs/ui.md). Operator: Sanity CORS + redeploy CV.

If CDN reads fail in the admin, add CORS origins in Sanity Manage: `http://localhost:4300` and `https://cv-admin-panel.web.app`.

Live admin: https://cv-admin-panel.web.app  
CV: https://miguel-angel-gutierrez-ibague.web.app

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

## Deployment

Same Firebase **project** as the CV, **different Hosting site** (`cv-admin-panel` → https://cv-admin-panel.web.app). Does not overwrite the portfolio.

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `.github/workflows/ci.yml` | Push / PR to `main` | `npm ci` + `npm run build` |
| `.github/workflows/deploy.yml` | Push to `main` (and manual) | Build + deploy live to admin site |
| `.github/workflows/firebase-hosting-pull-request.yml` | PR to `main` | Build + preview channel |

Required secret: `FIREBASE_SERVICE_ACCOUNT` (same project as the CV; can reuse that JSON). Details: [docs/deploy.md](docs/deploy.md).

### Manual

```bash
npm run build
npx firebase-tools deploy --only hosting:admin
```

## Recommended stack (v1)

See **[docs/stack.md](docs/stack.md)**.

| Layer | Choice |
| --- | --- |
| UI | Angular 22 + TypeScript + Sass (Node >= 24.15) |
| Auth | Firebase Auth email/password (**Phase 2 done**) |
| Writes | Cloud Functions `sanityWrite` (**Phase 3 code done**; set secret + deploy) |
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
| [docs/ui.md](docs/ui.md) | Login Figma / visual direction |
| [docs/go-live.md](docs/go-live.md) | Phase 6: CORS, Auth domains, smoke |
| [docs/proxy-setup.md](docs/proxy-setup.md) | Sanity write proxy + secrets (Phase 3) |
| [docs/deploy.md](docs/deploy.md) | Hosting dual-site + GitHub Actions |
| [docs/auth-setup.md](docs/auth-setup.md) | Firebase Auth Console steps (Phase 2) |
| [docs/stack.md](docs/stack.md) | Recommended stack |
| [docs/contract.md](docs/contract.md) | Non-negotiables, Sanity IDs |
| [docs/architecture.md](docs/architecture.md) | System shape |
| [docs/security.md](docs/security.md) | Tokens, auth, CORS |
| [docs/roadmap.md](docs/roadmap.md) | Phased delivery |

## Delivery phases (summary)

0. Docs bootstrap + stack lock ← **done**  
1. Angular scaffold + port 4300 + public-safe env ← **done**  
2. Firebase Auth ← **done**  
3. Cloud Functions write proxy ← **done**  
4. MVP screens: site, profile, projects ← **done**  
5. Slice 2: experience, courses, navigation ← **done**  
6. Polish, deploy, CORS, prod `adminLoginUrl` ← **done**  
7. Later: tests + lint → CI  

## Agent documentation sync

Keep aligned in the same change set: `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.cursor/rules/`.
