# Roadmap / plan de trabajo

Plan de entrega para `cv-admin-panel`, derivado de  
[`admin-app-brief.md`](../../miguelgutierrezi.github.io/docs/admin-app-brief.md).

Estado del workspace: Phase 4 MVP screens **done** (site / profile / projects). Siguiente: Phase 5 slice 2. CORS: añadir `http://localhost:4300` y `https://cv-admin-panel.web.app` en Sanity Manage si la lectura CDN falla.

## Objetivo de producto

Permitir a Miguel editar el contenido del CV/portfolio en Sanity sin tocar código del sitio público, vía una UI propia y un proxy de escritura autenticado.

## No objetivos (v1)

- Editor de schemas Sanity
- Multi-autor / multi-tenant
- Microfrontend dentro del portfolio
- Sustituir el CV Angular público

## Fases

### Phase 0: Docs bootstrap — **done**

- [x] Adaptar el brief en `docs/contract.md`
- [x] `docs/architecture.md`, `docs/security.md`, `docs/roadmap.md`
- [x] `docs/stack.md` — stack recomendada (Angular 22 + Firebase Auth + Cloud Functions + Hosting)
- [x] `AGENTS.md` (+ sync con `CLAUDE.md`, Copilot, Cursor rules)
- [x] README orientado a agentes y humanos

**Done when:** un agente puede arrancar el scaffold sin reinventar el CMS ni poner tokens en el cliente.  
**Stack lock:** seguir [stack.md](./stack.md) salvo decisión explícita en contrario.

### Phase 1: Scaffold — **done**

Según [stack.md](./stack.md):

- [x] Angular 22 app (standalone / application builder) + Node >= 24.15 (`.nvmrc`)
- [x] Sass; sin Bootstrap por defecto
- [x] `package.json` scripts (`start` → **port 4300**, `build`)
- [x] `environment`: `sanity` (`xm49cfca` / `production` / `apiVersion`), `proxyBaseUrl`, Firebase web placeholders, `portfolioUrl`
- [x] Shell mínimo de la app (sin write token)
- [x] Esqueleto Firebase (`firebase.json`, Hosting target `admin` → site `cv-admin-panel`)
- [x] CI: `npm ci` + `npm run build` (GitHub Actions)
- [x] Deploy live + preview workflows (requiere secret `FIREBASE_SERVICE_ACCOUNT`)

**Done when:** `npm run build` pasa — **sí**. Integración local: CV `:4200` Login → admin `:4300`.

### Phase 2: Auth — **done**

- [x] Firebase Auth email/password (single-user) + web app en proyecto `miguel-angel-gutierrez-ibague`
- [x] Login screen (`/login`) + session persistence (`onAuthStateChanged`)
- [x] Route guard: sin sesión → `/login`; guest en login si ya hay sesión
- [x] Logout en shell home
- [x] `AuthService.getIdToken()` listo para Phase 3
- [x] Guía: [auth-setup.md](./auth-setup.md) (habilitar Email/Password + crear usuario en Console)

**Done when:** rutas protegidas redirigen a login; sesión válida permite navegar el shell — **sí** (tras activar provider + usuario en Console).

### Phase 3: Write proxy — **done (código)**

- [x] Firebase Cloud Functions 2nd gen (`sanityWrite` + `@sanity/client`)
- [x] Verificar Firebase Auth en callable (`request.auth`)
- [x] Payloads acotados: `ping` | `patch` | `createOrReplace` | `delete` + allowlist de `_type`
- [x] Errores `HttpsError` al cliente (sin filtrar el write token)
- [x] Secret `SANITY_WRITE_TOKEN` vía `defineSecret` (Secret Manager)
- [x] Cliente `SanityProxyService` + botón **Probar proxy (ping)**
- [x] Guía: [proxy-setup.md](./proxy-setup.md)
- [ ] Operador: crear token Sanity + `firebase functions:secrets:set SANITY_WRITE_TOKEN` + deploy functions (Blaze)

**Done when:** ping/mutate con sesión válida — **código listo**; falta secret + deploy de Functions en el proyecto.

### Phase 4: MVP screens (slice 1) — **done**

- [x] `siteSettings` (singleton form + createOrReplace)
- [x] `profile` (singleton form + createOrReplace)
- [x] `project` list + form con **`detail` obligatorio** (features/gallery opcionales)
- [x] Save vía `sanityWrite`; lectura CDN (`SanityReadService`)
- [x] Shell nav: Inicio / Site / Profile / Projects

**Done when:** editar site/profile/project se refleja en el CV — tras CORS admin + publish. Smoke local/prod en el admin.

### Phase 5: Slice 2 screens — **siguiente**

- [ ] `experience` list + form (slug = id estable)
- [ ] `course` list + form (`credentialUrl` opcional)
- [ ] `navigation` singleton (`items[]`)

**Done when:** colecciones slice 2 editables y visibles en el portfolio (merge remoto).

### Phase 6: Polish + go-live

- [ ] Validación alineada a reglas del portfolio (`detail`, URLs, ids únicos)
- [ ] Helpers de imagen / asset URL si hace falta
- [ ] Deploy admin + CORS Sanity + `adminLoginUrl` en portfolio prod
- [ ] Checklist de integración del contract
- [ ] (Opcional) seed completo usando notas en `studio/seed/`

**Done when:** Login del CV abre este admin; un cambio editorial aparece en producción vía CDN.

### Phase 7 (later): Quality gates

- [ ] Suite de tests real + `npm run lint`
- [ ] Wire lint/tests en CI
- Hasta entonces: validar con `npm run build` (+ smoke manual)

## Orden sugerido de trabajo (agentes)

1. Phase 0 ✓ — stack fijada en [stack.md](./stack.md).
2. Phase 1 ✓ — scaffold Angular en **puerto 4300** (CV Login local → este admin).
3. Phase 2 ✓ — Firebase Auth gate ([auth-setup.md](./auth-setup.md)).
4. Phase 3 ✓ — Cloud Functions `sanityWrite` ([proxy-setup.md](./proxy-setup.md)).
5. Phase 4 ✓ — pantallas MVP site / profile / projects.
6. Phase 5 slice 2 — **siguiente**.
7. Phase 6 go-live (CORS + `adminLoginUrl` prod).
8. No tocar schemas del portfolio salvo que el usuario pida un cambio de modelo (eso vive en `studio/`).

## Lectura previa (portfolio)

| Doc | Por qué |
| --- | --- |
| `docs/admin-app-brief.md` | Contrato canónico |
| `docs/cms-strategy.md` | Seguridad y secuencia CMS |
| `docs/architecture.md` | Separación contenido/presentación |
| `docs/improvement-plan.md` | Estado del sitio público |
| `studio/README.md` | Studio + URL hosted |
| `CLAUDE.md` / `.cursor/rules/cms-security.mdc` | Restricciones de agentes en el CV |

## Lectura en este repo

| Doc | Por qué |
| --- | --- |
| [stack.md](./stack.md) | Stack recomendada y camino bloqueado |
| [deploy.md](./deploy.md) | Dos sites Hosting + GitHub Actions |
| [auth-setup.md](./auth-setup.md) | Email/Password + usuario |
| [contract.md](./contract.md) | Non-negotiables locales |
| [architecture.md](./architecture.md) | Forma del sistema |
| [security.md](./security.md) | Tokens y auth |
