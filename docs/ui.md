# UI / design notes

Visual direction for the admin SPA. Source of truth for auth chrome: Figma file **Hoja de vida** (`46kvlyIdv8hDZlIJbJektz`).

## Login (`/login`)

- **Implemented:** desktop, tablet landscape, tablet portrait, mobile.
- Frames:
  - `admin-login-desktop` (`32:5`) — 1440×900, card density default (440px)
  - `admin-login-tablet-landscape` (`32:159`) — 1024×768, **denser** card (`max-width: 1100px` + `orientation: landscape`)
  - `admin-login-tablet-portrait` (`32:84`) — 768×1024, **same card spacing as desktop**, glow 500px @ ~8% (`481px–900px` + `orientation: portrait`)
  - `admin-login-mobile` (`32:230`) — 390×844, **full-width** card radius 12, compact type (`max-width: 480px`); do not paint the iOS status-bar chrome from Figma
- **Dark terminal shell** — intentional gate; content screens may stay light.
- Tokens aligned with the CV dark chrome (`#0B0F19`, `#111827`, `#1E293B`, accent `#06B6D4`, link `#00F2FE`, Geist Sans / Geist Mono).
- Brand handle: `miguel.gutierrez` (not the Figma placeholder).
- CTA: **Iniciar Sesión**; secondary: **← Ver Portfolio** → `environment.portfolioUrl`.
- No “forgot password” in v1 (single-user Firebase Auth).
- Assets: `public/assets/login/` (grid, lock, terminal icons).

## Post-login (editorial)

- Phase 4–5 screens are still functional light forms.
- Preferred direction: **login dark → content light**, same token family as the CV (`miguelgutierrezi.github.io/src/styles.sass` `:root`).
- Future Figma frames for shell/lists/forms should reuse those tokens; do not invent a second palette.

## Agent notes

- When implementing Figma screens, update this file + sync `AGENTS.md` / `CLAUDE.md` / Copilot / Cursor rules in the same change set.
- Prefer matching CV CSS variables later (`--color-accent`, etc.) over hardcoding new hex values.
