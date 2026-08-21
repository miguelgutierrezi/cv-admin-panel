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
- Pattern: breadcrumb · title · **Descartar** / **[+] Guardar** · status strip · **two panels** (General Info | Social Links).
- Shared chrome: `src/styles/_edit.scss` (fields `$` / `>`, item cards, actions).
- Logic: Sanity read + proxy `createOrReplace`; Descartar restores snapshot.

## Profile (`/profile`)

- **Desktop:** `admin-profile-detail` (`62:632`).
- Same shell as Site Settings; panels: **Identity & Roles** | **Biography Details** (paragraph cards ES/EN).
- Diffs vs Site Settings: paragraph chrome **dark** (`#070B13`); footer **dark**; rows ES/EN for role/pitch/focusAreas.
- Reuses `_edit.scss` + Descartar/snapshot.

## Projects list (`/projects`)

- **Empty desktop:** `admin-projects-list-empty` (`66:269`) — empty panel `$_`.
- **Populated desktop:** `admin-projects-list` (`65:4`) — table panel: order badge, title + slug, ★ FEATURED, edit/delete icons.
- Pattern: breadcrumb · `LIST_VIEW · N documentos` · **[+] Nuevo project** · status banner.
- Shell search: `grep project_name…`; filtra title/slug/id. Delete vía proxy + confirm.

## Project form (`/projects/:id` | `/projects/new`)

- **Desktop:** `admin-project-detail` (`65:118`).
- Stacked panels: General Info · Detail · Body paragraphs · Features · Gallery.
- Chrome: `<- Projects / {title}` · `EDITING_DOCUMENT` · **Eliminar** (rojo) / **[+] Guardar** · featured toggle verde.
- Reuses `_edit.scss`; lógica Sanity sin cambios.

## Experiences list (`/experience`)

- **Empty desktop:** `admin-experiences-list-empty` (`66:316`) — CTA **neon** `[+] Nuevo experience` · empty `$_`.
- **Populated desktop:** `admin-experiences-list` (`65:520`) — table: order · company + slug · role (columna STATUS) · edit/delete; CTA dark `[+] Nueva experience`.
- Collection `experiences-main`. Shell search: `grep experience…`; filtra company/slug/role.
- Shared list chrome: `src/styles/_list.scss` (`.data-table`).

## Experience form (`/experience/:id` | `/experience/new`)

- **Desktop (new):** `admin-experience-new` (`65:573`).
- Single white panel · 5 field-rows (slug/company · roles · durations · responsibilities · imageUrl/sortOrder).
- Chrome: `<- Experiences / New Experience` · `NEW_DOCUMENT` · **[+] Guardar** (edit: `EDITING_DOCUMENT` + Eliminar).
- Reuses `_edit.scss`; lógica Sanity sin cambios.

## Courses list (`/courses`)

- **Empty desktop:** `admin-courses-list-empty` (`66:5`) — CTA dark `[+] Nuevo course` · empty `$_` · collection `courses-main`.
- **Populated desktop:** `admin-courses-list` (`66:48`) — table: order · title+slug · institution · ✓ published / • draft · edit/delete.
- Shell search: `grep courses…`; filtra title/institution/slug. Delete vía proxy + confirm.
- Status badge: published si title+institution+imageUrl; else draft (CDN no trae drafts reales).

## Course form (`/courses/:id` | `/courses/new`)

- **Desktop (new):** `admin-courses-new` (`66:152`).
- Panel `# SECTION_01 Course Meta` · Course Specifications & Credentials.
- Fields: slug · title ES/EN · institution · date ES/EN · imageUrl · credentialUrl · sortOrder (con `>` prompt + required *).
- Chrome: `<- Courses / Nuevo course` · `CREATING_INSTANCE` · **Descartar** / **[+] Guardar** · status strip · footer **dark**.
- Edit: `EDITING_INSTANCE` + Eliminar + Descartar (snapshot). Shell form: `grep config_key…`.

## Navigation (`/navigation`)

- **Desktop:** `admin-navigation` (`66:362`).
- Chrome: `<- Content Types / Navigation` · `CONFIGURING_NAVIGATION` · pill **[+] Guardar**.
- `# Items` + `+ Añadir` · cards: section id (select about/projects/experience/courses) · label ES/EN · `[x] Quitar Item`.
- Footer dark. Shell: `grep config_key…`. Singleton Sanity `navigation`.

## Post-login (editorial)

- Preferred: login dark → hub/forms light, same token family as the CV.
- Shared editorial chrome in `_edit.scss`; adapt layout per Figma frame (don’t force Site Settings split if a type differs).

## Agent notes

- When implementing Figma screens, update this file + sync `AGENTS.md` / `CLAUDE.md` / Copilot / Cursor rules in the same change set.
- Prefer matching CV CSS variables later (`--color-accent`, etc.) over hardcoding new hex values.
