# Remote model settings deploy checklist

## Completed

- [x] Root cause fixed: Settings now waits for the explicit `connection` dependency.
- [x] Consumer test benches provide the same dependency contract as real composition.
- [x] Focused tests: 8 files / 83 tests passed.
- [x] Repository typecheck, including Host build and client contract typecheck, passed.
- [x] Changed-surface staged lint passed.
- [x] Client library and production Web frontend builds passed.

## Deployment gates

- [x] Add production deployment guardrails to `AGENTS.md`.
- [x] Commit and push to `origin`.
- [x] Verify server is healthy and idle enough before deployment.
- [x] Transfer/install only completed runtime artifacts; no server build, install, or test.
- [x] Restart shared Harness and verify health; left the unchanged proxy running.
- [x] Verify served module graph, process count, listener, journal, and memory.

## Deployment evidence

- Deployed commit: `090748f3e897dea769b31303e8596aaf07fccb7d`.
- Server branch: `deploy-shared-harness-v5`.
- Shared Harness PID: `2198`; proxy PID: `1828`.
- Shared Harness memory: approximately `434 MB`; proxy memory: approximately `71 MB`.
- Host available memory after restart: approximately `2.6 GiB`; swap in use: `0 B`.
- `127.0.0.1:3094`, `127.0.0.1:3080`, and `127.0.0.1:3081` have the expected listeners.
- The served page injects `__DSH_AUTHENTICATED_REMOTE__ = true`, and its plugin bundle contains the `connection` and `authenticatedRemote` markers.
- Recent shared Harness and proxy journals contain no warning or error entries.
- Rollback frontend artifact: `apps/web/.dist-backup-7c7f637-20260914133734`.
