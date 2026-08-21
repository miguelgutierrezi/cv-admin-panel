# UI / design notes

Visual direction for the admin SPA. Source of truth: Figma file **Hoja de vida** (`46kvlyIdv8hDZlIJbJektz`).

## Login (`/login`)

- **Implemented:** desktop, tablet landscape, tablet portrait, mobile.
- Frames: `32:5`, `32:159`, `32:84`, `32:230`.
- Dark terminal shell; brand `miguel.gutierrez`; CTA + **← Ver Portfolio**.
- Assets: `public/assets/login/`.

## Home / content types hub (`/`)

- **Desktop:** `admin-dashboard-content-types` (`41:4`) — 3-column card grid.
- **Tablet landscape:** `admin-dashboard-tablet-landscape` (`61:161`, ~1024) — 3 cols denser (gap 16), nav height 64, search 220px `grep type_name…`, title 22px, grid ~3%.
- **Tablet portrait:** `admin-dashboard-tablet-portrait` (`61:4`, 768×1024) — 2×3 grid, denser type, search `grep…` @ 200px, nav padding `0 24px` / height 72.
- **Mobile:** `admin-dashboard-mobile` (`61:315`, ~390) — single-column cards; navbar **sin search**; brand + Portfolio + **Exit**; title/welcome stacked (gap 12); featured border neon 1.5px.
- Breakpoints use `orientation` so landscape vs portrait don’t collide.
- Pattern: **dark top navbar** + **light main** (`#F8FAFC`) + subtle grid (desktop ~6%, tablet portrait ~4%).
- Navbar (fiel a Figma): brand `[ handle ]` · search `$ grep…` · botón **Portfolio** (dark + arrow-up-right) · **Logout**.
- Six cards → `/site`, `/profile`, `/projects`, `/experience`, `/courses`, `/navigation`.
- Shell search filters the cards (client-side). No ES/EN global in current Figma navbar.
- Assets: `public/assets/dashboard/`.
- Editorial forms keep functional light layout under the same shell.

## Post-login (editorial)

- Preferred: login dark → hub/forms light, same token family as the CV.
- Future Figma frames for list/form screens should reuse these tokens.

## Agent notes

- When implementing Figma screens, update this file + sync `AGENTS.md` / `CLAUDE.md` / Copilot / Cursor rules in the same change set.
- Prefer matching CV CSS variables later (`--color-accent`, etc.) over hardcoding new hex values.
