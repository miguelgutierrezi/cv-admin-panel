# Roadmap / plan de trabajo

Plan de entrega para `cv-admin-panel`, derivado de  
[`admin-app-brief.md`](../../miguelgutierrezi.github.io/docs/admin-app-brief.md).

Estado del workspace: Phase 1 scaffold **done** (Angular en **puerto 4300**). Siguiente: Phase 2 Auth.

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
- [ ] Esqueleto Firebase (`firebase.json`, Hosting target) — con Auth/Functions
- [ ] CI mínimo: `npm ci` + `npm run build` (GitHub Actions)

**Done when:** `npm run build` pasa — **sí**. Integración local: CV `:4200` Login → admin `:4300`.

### Phase 2: Auth — **siguiente**

- [ ] Firebase Auth email/password (single-user)
- [ ] Login screen + session persistence
- [ ] Route guard: sin sesión no hay pantallas de edición
- [ ] Logout

**Done when:** rutas protegidas redirigen a login; sesión válida permite navegar el shell.

### Phase 3: Write proxy

- [ ] Firebase Cloud Functions 2nd gen (`@sanity/client` + `SANITY_WRITE_TOKEN`)
- [ ] Verificar Firebase ID token antes de mutar
- [ ] Payloads acotados (tipo de documento + patch); no proxy abierto
- [ ] Errores claros al cliente (401/403/4xx Sanity) sin filtrar el write token
- [ ] Secrets en el host del proxy / secret manager, no en el repo

**Done when:** un mutate de prueba (p. ej. patch de título) funciona solo con sesión válida.

### Phase 4: MVP screens (slice 1)

- [ ] `siteSettings` (singleton)
- [ ] `profile` (singleton)
- [ ] `project` list + form con **`detail` obligatorio**
- [ ] Publish / save flow vía proxy
- [ ] Lectura inicial (CDN o API) para hidratar formularios

**Done when:** editar site/profile/project se refleja en el CV público tras publish (smoke con portfolio).

### Phase 5: Slice 2 screens

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
3. Phase 2 Firebase Auth gate — **siguiente**.
4. Phase 3 Cloud Functions proxy (bloqueante para cualquier mutate real).
5. Phase 4 MVP → Phase 5 slice 2 → Phase 6 go-live.
6. No tocar schemas del portfolio salvo que el usuario pida un cambio de modelo (eso vive en `studio/`).

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
| [contract.md](./contract.md) | Non-negotiables locales |
| [architecture.md](./architecture.md) | Forma del sistema |
| [security.md](./security.md) | Tokens y auth |
