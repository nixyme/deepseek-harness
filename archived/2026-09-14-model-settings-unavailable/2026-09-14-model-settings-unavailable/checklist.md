# Model settings unavailable after deployment

## Evidence

- Production screenshot shows the Models page falling back to process-local settings with `settings are unavailable in this browser`.
- The deployed HTML currently injects `__DSH_AUTHENTICATED_REMOTE__ = true`, and the built `ui-settings` bundle reads it before selecting Host persistence.
- An authenticated production index response lacks `Cache-Control`; a browser may therefore reuse an older shell and older plugin revisions even after deployment.
- The old shell can retain a `ui-settings` build that selects `memory` persistence, producing exactly the screenshot error.

## Plan

- [x] Serve rendered SPA index responses with `Cache-Control: no-store`.
- [ ] Preserve normal caching behavior for revision-addressed assets.
- [x] Preserve normal caching behavior for revision-addressed assets.
- [x] Extend real-composition frontend-static tests to assert the shell and asset cache boundary.
- [x] Run focused tests, typecheck, and production frontend build locally.
- [x] Commit, push, deploy runtime artifacts only, and verify production headers plus Models behavior.

## Local verification

- `frontend-static` real-composition test passed and asserts `no-store` on `/`, `/index.html`, `/index.html?fixture`, and authenticated HEAD; static assets keep no explicit cache directive.
- `ui-settings` and `ui-settings-models` focused regression suites passed: 3 files / 34 tests.
- Full repository typecheck passed.
- Production Web frontend build passed.
- Local shared Harness verify script passed: UI, owner/member defaults, owner isolation, cross-owner denial, and WebSocket.
- Local authenticated page observed `Cache-Control: no-store`, `__DSH_AUTHENTICATED_REMOTE__ = true`, and the expected `ui-settings` plugin entry.

## Deployment evidence

- Deployed commit: `a196338219946553833aeeea58a69e8e7a4112d6`.
- Server branch: `deploy-shared-harness-v6`.
- Only `packages/host/frontend-static/lib/index.js` was replaced; the previous file remains at `packages/host/frontend-static/lib/index.js.backup-a196338-20260914141700`.
- The proxy was not restarted and remained on PID `1828`; only the shared Harness user service restarted.
- New Harness PID: `2754`; RSS stabilized near `462 MB`.
- After restart: unauthenticated `/` returned `401`, available host memory was `2.6 GiB`, and swap usage remained `0 B`.
- Recent Harness journal contained no warning or error entries.
- Production authenticated page now returns `Cache-Control: no-store`, contains `ui-settings`, and injects `__DSH_AUTHENTICATED_REMOTE__ = true`.
- Production `settings/describe` returned `ok=true`, `writable=true`, and `18` namespaces.
- Production `llm/listConfigurableProviders` returned `ok=true` and `40` providers.
