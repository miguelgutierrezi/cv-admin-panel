# UI / design notes

Visual direction for the admin SPA. Source of truth: Figma file **Hoja de vida** (`46kvlyIdv8hDZlIJbJektz`).

**Document title:** `Admin - Miguel Ángel Gutiérrez Ibagué` (`src/index.html`). Repo / Firebase web app name can stay **CV Admin Panel**.

**Footer (override):** always **light/white** (`var(--card)` / `#fff`) on editorial pages — ignore Figma dark status bars.

**Buttons (override):** desktop / tablet follow **Site Settings** (title left · actions right). **Mobile** follows **New Course** (`79:4`) — title stack · **Descartar** + **[+] Guardar** full-width equal (`10×16` / `10×18`, gap 10). Landscape denser `8×14` / `8×16`; desktop/portrait `10×16` / `10×18`. Optional **Eliminar** before Descartar. Shared chrome in `_edit.scss`. List CTAs use `edit__btn--save`. All edit screens include **Descartar**.

**Shell navbar (shared — all routes):** brand `[ handle ]` · search `$ grep…` · **Portfolio** · **Logout** / **Exit** (mobile).

| Viewport | Height | Padding | Notes |
| --- | --- | --- | --- |
| Desktop (>1280 or non-tablet) | **72** | `0 40px` | Override vs Site Settings / Home Figma `padding: 24` all-sides — match Profile / Navigation |
| Tablet landscape | **64** | `0 24px` | Search default 220px; route variants in `admin-shell.ts` |
| Tablet portrait | **72** | `0 24px` | Search often 180–200px |
| Mobile (≤720) | hug | `16px` | **Sin search** |

Shell fill under the nav is **surface** (not navy) + `overscroll-behavior: none` so tablet bounce no revela `#0B0F19` debajo del footer.

## Login (`/login`)

- **Implemented:** desktop, tablet landscape, tablet portrait, mobile.
- Frames: `32:5`, `32:159`, `32:84`, `32:230`.
- Dark terminal shell; brand `miguel.gutierrez`; CTA + **← Ver Portfolio**.
- Assets: `public/assets/login/`.

## Home / content types hub (`/`)

- **Desktop:** `admin-dashboard-content-types` (`41:4`) — 3-column card grid.
- **Tablet landscape:** `admin-dashboard-tablet-landscape` (`61:161`, ~1024) — 3 cols denser (gap 16), nav height 64, search 220px `grep type_name…`, title 22px, grid ~3%.
- **Tablet portrait:** `admin-dashboard-tablet-portrait` (`61:4`, 768×1024) — 2×3 grid, denser type, search `grep…` @ 200px, nav padding `0 24px` / height 72.
- **Mobile:** `admin-dashboard-mobile` (`61:315`, ~390) — single-column cards; navbar **sin search**; brand + Portfolio + **Exit**; title/welcome stacked (gap 12).
- Card neon border is **hover/focus only** (Figma interaction), not a static “featured” state.
- Breakpoints use `orientation` so landscape vs portrait don’t collide.
- Pattern: **dark top navbar** + **light main** (`#F8FAFC`) + subtle grid (desktop ~6%, tablet portrait ~4%).
- Six cards → `/site`, `/profile`, `/projects`, `/experience`, `/courses`, `/navigation`.
- Shell search filters the cards (client-side). No ES/EN global in current Figma navbar.
- Assets: `public/assets/dashboard/`.

## Site Settings (`/site`)

- **Desktop:** `admin-site-settings-detail` (`62:4`) — shell nav unificado (`0 40px` / 72), no el padding 24 all-sides del frame.
- **Tablet landscape:** `admin-site-settings-tablet-landscape` (`62:205`, ~1024) — denser chrome (padding 24, title 24px, panels gap 20, panel pad 20); **sigue en 2 columnas**; shell nav 64 / search 220 `grep config_key…`.
- **Tablet portrait:** `admin-site-settings-tablet-portrait` (`62:349`, ~768) — padding `28/24`, title 24px, **paneles apilados**, panel pad 24 / gap 20, footer **light**; shell search `grep config…` @ 180px.
- **Mobile:** `admin-site-settings-mobile` (`62:496`, ~390) — padding `20/16`, title 22px, paneles pad 16, status corto, footer **light**; shell **sin search**. **Descartar** + **[+] Guardar** (override: Descartar siempre visible).
- Pattern: breadcrumb · title · **Descartar** / **[+] Guardar** · status strip · **two panels** (General Info | Social Links).
- Shared chrome: `src/styles/_edit.scss` (fields `$` / `>`, item cards, actions).
- Logic: Sanity read + proxy `createOrReplace`; Descartar restores snapshot.

## Profile (`/profile`)

- **Desktop:** `admin-profile-detail` (`62:632`).
- **Tablet landscape:** `admin-profile-detail-tablet-landscape` (`68:4`, ~1024) — denser (padding 24, title 26px, panels gap 16, panel pad 20); **2 columnas**; paragraph chrome dark; footer **light**; shell nav 64 / search 220 `grep config_key…`.
- **Tablet portrait:** `admin-profile-detail-tablet-portrait` (`68:161`, ~768) — padding `24/24`, title 26px, **paneles apilados** (gap 20), panel pad 20; role/pitch/focus siguen en filas ES|EN; footer **light**; shell search `grep config…` @ 180px.
- **Mobile:** `admin-profile-detail-mobile` (`68:302`, ~390) — padding `20/16`, title 22px, crumb `Content`, paneles pad 16, campos apilados, **Descartar** + **Guardar**, paragraph chrome dark, footer **light** apilado; shell **sin search**.
- Same shell as Site Settings; panels: **Identity & Roles** | **Biography Details** (paragraph cards ES/EN).
- Diffs vs Site Settings: paragraph chrome **dark** (`#070B13`); footer **light**; rows ES/EN for role/pitch/focusAreas.
- Reuses `_edit.scss` + Descartar/snapshot.

## Projects list (`/projects`)

- **Empty desktop:** `admin-projects-list-empty` (`66:269`) — empty panel `$_`.
- **Empty tablet landscape:** `admin-projects-list-empty-tablet-landscape` (`72:4`, ~1024) — padding 32, empty pad `100px 40px`, title empty 18px; crumb Content Types underlined.
- **Empty tablet portrait:** `admin-projects-list-empty-tablet-portrait` (`71:4`, ~768) — padding `24/24`, empty pad `80px 24px`, empty title 16px; footer light 40px; shell search `grep project…` @ 180px (mismo chrome que populated).
- **Empty mobile:** `admin-projects-empty-mobile` (`77:409`, ~390) — padding `16/16`, title 22px, CTA full-width, status multilínea, empty pad `48/16` + icon 48, footer **light** apilado + `• Conectado`; shell **sin search**.
- **Populated mobile:** `admin-projects-list-mobile` (`77:448`, ~390) — padding `20/16`, CTA full-width, status 2 líneas (`Match: N`), header `# SCHEMATICS…` / `META / CTRL`, filas densas (order+title | featured+ctrl en columna), slug sin prefijo; footer **light**; shell **sin search**.
- **Populated desktop:** `admin-projects-list` (`65:4`) — table: order badge, title + slug, ★ FEATURED, edit/delete.
- **Populated tablet landscape:** `admin-projects-list-tablet-landscape` (`72:47`, ~1024) — padding `32/24`, table gap 16, header “PROJECT SCREENSHOTS & DESCRIPTION”, hover left cyan; shell search `grep project_name…` @ 240px.
- **Populated tablet portrait:** `admin-projects-list-tablet-portrait` (`74:4`, ~768) — padding `24/24`, title 24px, header “PROJECT SCHEMATICS & IDENTIFIER”, denser rows (`16×20`, gaps 16/20), STATUS @ 80px; shell search `grep project…` @ 180px.
- Pattern: breadcrumb · `LIST_VIEW · N documentos` · **[+] Nuevo project** · status banner.
- Shell search: `grep project_name…`; filtra title/slug/id. Delete vía proxy + confirm.

## Project form (`/projects/:id` | `/projects/new`)

- **Desktop:** `admin-project-detail` (`65:118`).
- **Tablet landscape:** `admin-project-detail-tablet-landscape` (`72:135`, ~1024) — padding 24, title 26px; General full-width; **Detail | Features** 2-col; Body/Gallery below; shell `grep config_key…` @ 220px.
- **Tablet portrait:** `admin-project-detail-tablet-portrait` (`74:100`, ~768) — padding `24/24`, title 26px; General full-width (filas ES|EN); **Detail | Features** 2-col; labels 12px; footer **light** 44px; shell `grep config…` @ 180px.
- **Mobile:** `admin-project-detail-mobile` (`78:565`, ~390) — padding `20/16`, title 24px, crumb Projects cyan / current muted; acciones header **Eliminar** / **Descartar** / **[+] Guardar**; paneles pad 16 apilados; featured full-width; footer **light** centrado; shell **sin search**.
- Stacked panels: General Info · Detail · Features · Body · Gallery (tablet: Detail∥Features).
- Chrome: `<- Projects / {title}` · `EDITING_DOCUMENT` · **Eliminar** (rojo) / **[+] Guardar** · featured toggle verde.
- Reuses `_edit.scss`; lógica Sanity sin cambios.

## Experiences list (`/experience`)

- **Empty desktop:** `admin-experiences-list-empty` (`66:316`) — CTA dark `[+] Nuevo experience` · empty `$_`.
- **Empty tablet landscape:** `admin-experiences-list-empty-tablet-landscape` (`72:341`, ~1024) — padding 32, empty pad `100px 40px`, empty title 18px; shell `grep experience…` @ 280px.
- **Empty tablet portrait:** `admin-experiences-list-empty-tablet-portrait` (`74:395`, ~768) — empty pad `80px 24px`, empty title 18px; shell `grep experience…` @ 180px (mismo chrome que populated).
- **Empty mobile:** `admin-experiences-empty-mobile` (`78:734`, ~390) — padding `20/16`, title 24px, CTA full-width, status multilínea, empty pad `48/20` + icon 52, footer **light** apilado; shell **sin search**.
- **Populated mobile:** `admin-experiences-list-mobile` (`78:774`, ~390) — title 22px + CTA corto `[+] Nueva` en fila; status 2 líneas; **cards** (order+company | ctrl · role badge · slug); footer **light**; shell **sin search**.
- **Populated desktop:** `admin-experiences-list` (`65:520`) — table: order · company + slug · role (columna STATUS) · edit/delete; CTA dark `[+] Nuevo experience`.
- **Populated tablet landscape:** `admin-experiences-list-tablet-landscape` (`72:382`, ~1024) — padding 32, table gap 16, STATUS/role @ 240px, slug 13px; shell search 280px.
- **Populated tablet portrait:** `admin-experiences-list-tablet-portrait` (`74:317`, ~768) — padding `24/24`, title 24px, header “EXPERIENCE DETAILS & EMPLOYER”, denser rows (`16×20`), STATUS/role @ 180px; CTA dark; shell `grep experience…` @ 180px.
- Collection `experiences-main`. Shell search: `grep experience…`; filtra company/slug/role.
- Shared list chrome: `src/styles/_list.scss` (`.data-table`).

## Experience form (`/experience/:id` | `/experience/new`)

- **Desktop (new):** `admin-experience-new` (`65:573`).
- **Tablet landscape:** `admin-experience-new-tablet-landscape` (`72:455`, ~1024) — padding `32/40`, fields sin card (gap 16, row gap 20), labels 13px, footer **light**; shell `grep experience…` @ 260px.
- **Tablet portrait:** `admin-experience-new-tablet-portrait` (`77:4`, ~768) — padding `28/24`, title 24px, fields sin card (gap 16, filas ES|EN), textareas 110px, footer **light**; shell `grep…` @ 160px.
- **Mobile:** `admin-experience-new-mobile` (`78:837`, ~390) — padding `20/16`, title 22px, fields sin card apilados (gap 16), inputs 40 / textareas 110, **Descartar** + **Guardar** en header; footer **light** apilado; shell **sin search**.
- Single white panel (desktop) · 5 field-rows (slug/company · roles · durations · responsibilities · imageUrl/sortOrder).
- Chrome: `<- Experiences / New Experience` · `NEW_DOCUMENT` · **Descartar** / **[+] Guardar** (edit: + Eliminar).
- Reuses `_edit.scss`; lógica Sanity sin cambios.

## Courses list (`/courses`)

- **Empty desktop:** `admin-courses-list-empty` (`66:5`) — CTA dark `[+] Nuevo course` · empty `$_` · collection `courses-main`.
- **Empty tablet landscape:** `admin-courses-list-empty-tablet-landscape` (`72:537`, ~1024) — padding 24 / gap 20, empty pad `80px 40px`, empty title 18px; shell `grep courses…` @ 240px.
- **Empty tablet portrait:** `admin-courses-empty-tablet-portrait` (`77:85`, ~768) — empty pad `80px 40px`, empty title 18px; footer **light**; shell `grep…` @ 180px (mismo chrome que populated).
- **Empty mobile:** `admin-courses-empty-mobile` (`78:907`, ~390) — padding `20/16`, title 24px, CTA full-width, status multilínea, empty pad `48/20` + icon circular 56, footer **light** apilado; shell **sin search**.
- **Populated desktop:** `admin-courses-list` (`66:48`) — table: order · title+slug · institution · ✓ published / • draft · edit/delete.
- **Populated tablet landscape:** `admin-courses-list-tablet-landscape` (`72:580`, ~1024) — padding `32/24`, COURSE DETAILS @ 280px, institution 180px, slug/badge 13px; shell search 240px.
- **Populated tablet portrait:** `admin-courses-list-tablet-portrait` (`77:128`, ~768) — padding `28/24`, title 28px, denser table (DETAILS flex, institution 120px, STATUS 100px, CONTROLS 80px); shell `grep…` @ 180px.
- **Populated mobile:** `admin-courses-list-mobile` (`78:960`, ~390) — title 22px + `N docs`, CTA full-width, status 2 líneas (`Matches:`), tabla densa `#` / DETAILS (title+institution) / STATUS / CTRL; badges cortos; footer **light**; shell **sin search**.
- Shell search: `grep courses…`; filtra title/institution/slug. Delete vía proxy + confirm.
- Status badge: published si title+institution+imageUrl; else draft (CDN no trae drafts reales).

## Course form (`/courses/:id` | `/courses/new`)

- **Desktop (new):** `admin-courses-new` (`66:152`).
- **Tablet landscape:** `admin-courses-new-tablet-landscape` (`72:674`, ~1024) — padding 32, fields sin card (gap 20), labels 13px, inputs 42px, footer **light**; shell `grep config_key…` @ 240px.
- **Tablet portrait:** `admin-course-new-tablet-portrait` (`77:222`, ~768) — padding `32/24`, title 28px, fields sin card (gap 20, filas ES|EN), inputs 42px, footer **light**; shell `grep config…` @ 180px.
- **Mobile:** `admin-course-detail-mobile` (`79:4`, ~390) — padding `24/16`, title 24px, **Descartar** + **Guardar** full-width en fila bajo el título, status pad `12/16` radius 10, fields sin card apilados (gap 16), inputs 42px; footer **light** apilado; shell **sin search**.
- Panel `# SECTION_01 Course Meta` · Course Specifications & Credentials.
- Fields: slug · title ES/EN · institution · date ES/EN · imageUrl · credentialUrl · sortOrder (con `>` prompt + required *).
- Chrome: `<- Courses / Nuevo course` · `CREATING_INSTANCE` · **Descartar** / **[+] Guardar** · status strip · footer **light**.
- Edit: `EDITING_INSTANCE` + Eliminar + Descartar (snapshot). Shell form: `grep config_key…`.

## Navigation (`/navigation`)

- **Desktop:** `admin-navigation` (`66:362`).
- **Tablet landscape:** `admin-navigation-tablet-landscape` (`73:4`, ~1024) — padding 32, cards gap 24, labels row gap 16, labels 13px, footer **light** `12×40`; shell `grep config_key…` @ 240px.
- **Tablet portrait:** `admin-navigation-tablet-portrait` (`77:319`, ~768) — padding `32/24`, title 28px, cards pad 24 / gap 20, labels ES|EN, footer **light**; shell `grep config…` @ 180px.
- **Mobile:** `admin-navigation-mobile` (`79:92`, ~390) — padding `24/16`, title 24px, **Descartar** + **Guardar** full-width bajo el título, cards pad 16 / gap 16, labels apilados, `[x] Quitar Item` full-width; footer **light** apilado; shell **sin search**.
- Chrome: `<- Content Types / Navigation` · `CONFIGURING_NAVIGATION` · **Descartar** / **[+] Guardar**.
- `# Items` + `+ Añadir` · cards: section id (select about/projects/experience/courses) · label ES/EN · `[x] Quitar Item`.
- Footer **light**. Shell: `grep config_key…`. Singleton Sanity `navigation`.

## Post-login (editorial)

- Preferred: login dark → hub/forms light, same token family as the CV.
- Shared editorial chrome in `_edit.scss`; adapt layout per Figma frame (don’t force Site Settings split if a type differs).
- **Responsive slice done** for Site → Navigation (desktop + tablet landscape/portrait + mobile) — see sections above.

## Agent notes

- When implementing Figma screens, update this file + sync `AGENTS.md` / `CLAUDE.md` / Copilot / Cursor rules in the same change set.
- Prefer matching CV CSS variables later (`--color-accent`, etc.) over hardcoding new hex values.
