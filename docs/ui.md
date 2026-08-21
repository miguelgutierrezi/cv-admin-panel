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
- Editorial: Site Settings desktop Figma (`62:4`) done — see below; other forms pending their frames.

## Site Settings (`/site`)

- **Desktop:** `admin-site-settings-detail` (`62:4`).
- **Tablet landscape:** `admin-site-settings-tablet-landscape` (`62:205`, ~1024) — denser chrome (padding 24, title 24px, panels gap 20, panel pad 20); **sigue en 2 columnas**; shell nav 64 / search 220 `grep config_key…`.
- Pattern: breadcrumb · title · **Descartar** / **[+] Guardar** · status strip · **two panels** (General Info | Social Links).
- Shared chrome: `src/styles/_edit.scss` (fields `$` / `>`, item cards, actions).
- Logic: Sanity read + proxy `createOrReplace`; Descartar restores snapshot.

## Profile (`/profile`)

- **Desktop:** `admin-profile-detail` (`62:632`).
- **Tablet landscape:** `admin-profile-detail-tablet-landscape` (`68:4`, ~1024) — denser (padding 24, title 26px, panels gap 16, panel pad 20); **2 columnas**; paragraph chrome dark; footer dark; shell nav 64 / search 220 `grep config_key…`.
- Same shell as Site Settings; panels: **Identity & Roles** | **Biography Details** (paragraph cards ES/EN).
- Diffs vs Site Settings: paragraph chrome **dark** (`#070B13`); footer **dark**; rows ES/EN for role/pitch/focusAreas.
- Reuses `_edit.scss` + Descartar/snapshot.

## Projects list (`/projects`)

- **Empty desktop:** `admin-projects-list-empty` (`66:269`) — empty panel `$_`.
- **Empty tablet landscape:** `admin-projects-list-empty-tablet-landscape` (`72:4`, ~1024) — padding 32, empty pad `100px 40px`, title empty 18px; crumb Content Types underlined.
- **Populated desktop:** `admin-projects-list` (`65:4`) — table: order badge, title + slug, ★ FEATURED, edit/delete.
- **Populated tablet landscape:** `admin-projects-list-tablet-landscape` (`72:47`, ~1024) — padding `32/24`, table gap 16, header “PROJECT SCREENSHOTS & DESCRIPTION”, hover left cyan; shell search `grep project_name…` @ 240px.
- Pattern: breadcrumb · `LIST_VIEW · N documentos` · **[+] Nuevo project** · status banner.
- Shell search: `grep project_name…`; filtra title/slug/id. Delete vía proxy + confirm.

## Project form (`/projects/:id` | `/projects/new`)

- **Desktop:** `admin-project-detail` (`65:118`).
- **Tablet landscape:** `admin-project-detail-tablet-landscape` (`72:135`, ~1024) — padding 24, title 26px; General full-width; **Detail | Features** 2-col; Body/Gallery below; shell `grep config_key…` @ 220px.
- Stacked panels: General Info · Detail · Features · Body · Gallery (tablet: Detail∥Features).
- Chrome: `<- Projects / {title}` · `EDITING_DOCUMENT` · **Eliminar** (rojo) / **[+] Guardar** · featured toggle verde.
- Reuses `_edit.scss`; lógica Sanity sin cambios.

## Experiences list (`/experience`)

- **Empty desktop:** `admin-experiences-list-empty` (`66:316`) — CTA **neon** `[+] Nuevo experience` · empty `$_`.
- **Empty tablet landscape:** `admin-experiences-list-empty-tablet-landscape` (`72:341`, ~1024) — padding 32, empty pad `100px 40px`, empty title 18px; shell `grep experience…` @ 280px.
- **Populated desktop:** `admin-experiences-list` (`65:520`) — table: order · company + slug · role (columna STATUS) · edit/delete; CTA dark `[+] Nueva experience`.
- **Populated tablet landscape:** `admin-experiences-list-tablet-landscape` (`72:382`, ~1024) — padding 32, table gap 16, STATUS/role @ 240px, slug 13px; shell search 280px.
- Collection `experiences-main`. Shell search: `grep experience…`; filtra company/slug/role.
- Shared list chrome: `src/styles/_list.scss` (`.data-table`).

## Experience form (`/experience/:id` | `/experience/new`)

- **Desktop (new):** `admin-experience-new` (`65:573`).
- **Tablet landscape:** `admin-experience-new-tablet-landscape` (`72:455`, ~1024) — padding `32/40`, fields sin card (gap 16, row gap 20), labels 13px, footer **dark**; shell `grep experience…` @ 260px.
- Single white panel (desktop) · 5 field-rows (slug/company · roles · durations · responsibilities · imageUrl/sortOrder).
- Chrome: `<- Experiences / New Experience` · `NEW_DOCUMENT` · **[+] Guardar** (edit: `EDITING_DOCUMENT` + Eliminar).
- Reuses `_edit.scss`; lógica Sanity sin cambios.

## Courses list (`/courses`)

- **Empty desktop:** `admin-courses-list-empty` (`66:5`) — CTA dark `[+] Nuevo course` · empty `$_` · collection `courses-main`.
- **Empty tablet landscape:** `admin-courses-list-empty-tablet-landscape` (`72:537`, ~1024) — padding 24 / gap 20, empty pad `80px 40px`, empty title 18px; shell `grep courses…` @ 240px.
- **Populated desktop:** `admin-courses-list` (`66:48`) — table: order · title+slug · institution · ✓ published / • draft · edit/delete.
- **Populated tablet landscape:** `admin-courses-list-tablet-landscape` (`72:580`, ~1024) — padding `32/24`, COURSE DETAILS @ 280px, institution 180px, slug/badge 13px; shell search 240px.
- Shell search: `grep courses…`; filtra title/institution/slug. Delete vía proxy + confirm.
- Status badge: published si title+institution+imageUrl; else draft (CDN no trae drafts reales).

## Course form (`/courses/:id` | `/courses/new`)

- **Desktop (new):** `admin-courses-new` (`66:152`).
- **Tablet landscape:** `admin-courses-new-tablet-landscape` (`72:674`, ~1024) — padding 32, fields sin card (gap 20), labels 13px, inputs 42px, footer **dark**; shell `grep config_key…` @ 240px.
- Panel `# SECTION_01 Course Meta` · Course Specifications & Credentials.
- Fields: slug · title ES/EN · institution · date ES/EN · imageUrl · credentialUrl · sortOrder (con `>` prompt + required *).
- Chrome: `<- Courses / Nuevo course` · `CREATING_INSTANCE` · **Descartar** / **[+] Guardar** · status strip · footer **dark**.
- Edit: `EDITING_INSTANCE` + Eliminar + Descartar (snapshot). Shell form: `grep config_key…`.

## Navigation (`/navigation`)

- **Desktop:** `admin-navigation` (`66:362`).
- **Tablet landscape:** `admin-navigation-tablet-landscape` (`73:4`, ~1024) — padding 32, cards gap 24, labels row gap 16, labels 13px, footer dark `12×40`; shell `grep config_key…` @ 240px.
- Chrome: `<- Content Types / Navigation` · `CONFIGURING_NAVIGATION` · pill **[+] Guardar**.
- `# Items` + `+ Añadir` · cards: section id (select about/projects/experience/courses) · label ES/EN · `[x] Quitar Item`.
- Footer dark. Shell: `grep config_key…`. Singleton Sanity `navigation`.

## Post-login (editorial)

- Preferred: login dark → hub/forms light, same token family as the CV.
- Shared editorial chrome in `_edit.scss`; adapt layout per Figma frame (don’t force Site Settings split if a type differs).

## Agent notes

- When implementing Figma screens, update this file + sync `AGENTS.md` / `CLAUDE.md` / Copilot / Cursor rules in the same change set.
- Prefer matching CV CSS variables later (`--color-accent`, etc.) over hardcoding new hex values.
