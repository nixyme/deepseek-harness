# Progress

## Implementation

- The boot wire now carries and validates `lazy` rows. Lazy rows remain globally addressable but are excluded from startup batches and eager activation.
- The full PDF renderer moved into `ui-sidebar-documentpreview-pdf`; its manifest requests the lightweight preview's `LoadingIndicator` as an explicit external client module.
- Opening a PDF shows a loading state, activates the lazy companion once, and offers retry after failure. Failed retained entries are removed before recreation.

## Verification

- Relevant Vitest suites: 39 files and 373 tests passed.
- `tsc -b tsconfig.client.json` passed.
- `pnpm run build` passed and recorded 237 client artifacts.
- Touched files passed targeted OxLint. The full lint gate still fails on unrelated historical findings.
- The composed production graph has one bootstrap plugin and 51 application plugins. The PDF row is marked lazy and appears in no batch.
- The PDF client bundle is 6.81 MiB raw; it is fetched only after a PDF preview activates it. Production revisioned URLs preserve browser caching.

## Production Deployment

- Commit: `df85ed4050708139381a208ec8a57171ec862edb` (`perf(web): lazy-load PDF preview engine`).
- Release staging: `/home/dsh/.local/state/deepseek-harness/releases/df85ed4`; all 7,996 runtime artifacts passed SHA-256 verification. The initial manifest included itself and failed predictably; it was regenerated while excluding `SHA256SUMS`, after which the remaining business artifacts passed.
- Pre-deployment backup: `/home/dsh/.local/state/deepseek-harness/backups/pre-df85ed4-20260914-191723/runtime-artifacts.tar` (102 MiB), plus the prior dirty overlay patch in the same directory.
- Server source switched to detached `df85ed4`; the shared overlay now enables full document preview and keeps only `dsh-market` and `modlens` disabled. No server-side install, build, TypeScript check, test, or bundling was run.
- Restarted only `dsh-shared-harness.service`. New PID 5575 listens on `127.0.0.1:3094`; `dsh-multiuser.service` remained active and continued listening on 3080/3081.
- Post-deployment health: shared Harness RSS about 412 MiB, about 2.5 GiB host memory available, load 0.07, 24 GiB disk available, and no recent error/fail/OOM/killed log entries.
- Production boot graph has 57 entries: bootstrap loads 1 plugin, application loads 55 plugins, and the 57th PDF entry is `lazy: true` outside every startup batch.
- Authenticated production transfer: application combo 1,742,473 compressed bytes in 0.183 seconds; PDF bundle 3,288,030 compressed bytes in 0.342 seconds. Both use gzip and immutable one-year cache headers. A cold PDF open still downloads its engine once, but it no longer blocks page load and later opens reuse the browser cache.
