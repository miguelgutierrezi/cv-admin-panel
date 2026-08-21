# Security

## Goals

- Prevent Sanity write credentials from ever reaching a browser bundle.
- Limit writes to an authenticated single author.
- Keep the public portfolio read-only and free of write secrets.

## Hosting vs secrets (common confusion)

Firebase **Hosting** only serves static assets. It is a valid host for the admin SPA (and already hosts the CV).

What the portfolio forbade was putting **write tokens in the Angular client** that Hosting then publishes to the world — not Firebase Hosting itself.

- **Hosting / SPA:** public; no `SANITY_WRITE_TOKEN`.
- **Cloud Functions (proxy):** private secrets; token lives here after auth checks.

See [stack.md](./stack.md) (“Clarification: Firebase Hosting ≠ write tokens in the bundle”).

## Rules

1. **Write token only on the server**  
   Store `SANITY_WRITE_TOKEN` (or equivalent) in the proxy host’s secret store / env. Never commit it. Never put it in `src/environments/*.ts` that Angular ships to the client.

2. **Authenticate before mutate**  
   The proxy (**Firebase Cloud Functions** per [stack.md](./stack.md)) must verify the caller’s Firebase ID token before calling Sanity Mutations / Patch. Reject unauthenticated and unauthorized requests.

3. **Least privilege**  
   Prefer a Sanity token scoped to the needed dataset and mutation capabilities. Do not reuse a god-mode token in more places than necessary.

4. **CORS and origins**  
   - Admin and portfolio origins that talk to Sanity from the browser must be allowlisted in Sanity Manage → API → CORS.  
   - The write proxy should only accept requests from expected admin origins (and/or require auth so origin alone is not the control).

5. **No multi-tenant assumptions in v1**  
   Single-author is enough. Do not build invite flows, roles, or shared workspaces until product asks for them.

6. **Client config is public-safe only**  
   Allowed in the Angular app: `projectId`, `dataset`, `apiVersion`, `proxyBaseUrl`, Firebase web config (public).  
   Forbidden: Sanity write tokens, service-account private keys, proxy service secrets.

7. **Do not weaken the portfolio**  
   Changes in this repo must not require write tokens in `miguelgutierrezi.github.io`. Portfolio Login remains a redirect.

## Threat notes (concise)

| Risk | Mitigation |
| --- | --- |
| Token leaked in Git / client | Secrets only in proxy; review env files and CI logs |
| Anonymous mutations | Auth gate on proxy; no public mutation endpoints |
| XSS → session abuse | Standard Angular hygiene; short-lived tokens; HTTPS only |
| Accidental schema edits | UI has no schema editor; Studio remains schema tooling |

## Operational checklist

- [ ] Proxy deployed with write token in secret store
- [ ] Admin origin in Sanity CORS (if browser reads CDN)
- [ ] Portfolio `adminLoginUrl` set only after admin HTTPS URL exists
- [ ] Smoke: unauthenticated write → 401/403; authenticated edit → published doc visible on CV CDN

## Related

- [Auth setup](./auth-setup.md)
- [Stack](./stack.md) — Firebase Auth + Cloud Functions as the default security shape
- [Contract](./contract.md)
- Portfolio `docs/cms-strategy.md` and `.cursor/rules/cms-security.mdc`
