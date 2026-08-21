# CV Admin Panel

Custom editorial UI for the Miguel Gutiérrez portfolio CMS (Sanity).

## Start here

This repo is the **write** side. The public CV lives in the sibling folder:

`../miguelgutierrezi.github.io/`

Before scaffolding code, have an agent (or human) read:

1. [`../miguelgutierrezi.github.io/docs/admin-app-brief.md`](../miguelgutierrezi.github.io/docs/admin-app-brief.md) — **contract / handoff**
2. Then create this project’s `docs/` (architecture, security, roadmap) from that brief.

## Rules of thumb

- No Sanity write tokens in the browser bundle
- Authenticated proxy for mutations
- Document CRUD only — schemas stay in the portfolio `studio/` package
- Portfolio Login will point here via `adminLoginUrl`
