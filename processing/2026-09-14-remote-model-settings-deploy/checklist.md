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
- [ ] Commit and push to both configured remotes.
- [ ] Verify server is healthy and idle enough before deployment.
- [ ] Transfer/install only completed runtime artifacts; no server build, install, or test.
- [ ] Restart shared Harness and verify health before restarting the proxy.
- [ ] Verify authenticated Models page, process count, listener, journal, and memory.
