# UI / design notes

Visual direction for the admin SPA. Source of truth: Figma file **Hoja de vida** (`46kvlyIdv8hDZlIJbJektz`).

## Login (`/login`)

- **Implemented:** desktop, tablet landscape, tablet portrait, mobile.
- Frames: `32:5`, `32:159`, `32:84`, `32:230`.
- Dark terminal shell; brand `miguel.gutierrez`; CTA + **← Ver Portfolio**.
- Assets: `public/assets/login/`.

## Home / content types hub (`/`)

- **Implemented:** `admin-dashboard-content-types` (`41:4`).
- Pattern: **dark top navbar** + **light main** (`#F8FAFC`) + subtle grid (~6% opacity).
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
