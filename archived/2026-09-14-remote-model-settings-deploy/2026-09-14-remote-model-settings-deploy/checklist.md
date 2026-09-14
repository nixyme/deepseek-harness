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
- [x] Revalidate service auto-start, process health, memory, listeners, authentication, and logs after the production host was force-rebooted.
- [x] Fast-forward the verified release commits to `master` and push `master`.

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

## Post-reboot evidence

- The user-level `dsh-shared-harness.service` is `active` and `enabled`.
- Host load was approximately `0.32`, available memory was `2.6 GiB`, and swap usage was `0 B`.
- Shared Harness remained a loopback-only listener on `127.0.0.1:3094`; unauthenticated root requests returned `401`.
- No failed systemd units and no recent warning/error entries were found.
- `master` was fast-forwarded from `7c7f637` to `3227910` and pushed successfully; its pre-push typecheck passed.
