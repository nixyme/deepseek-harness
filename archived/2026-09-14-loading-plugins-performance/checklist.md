# 2026-09-14 Loading plugins performance

## Goal

- Remove the approximately 60 second `Loading plugins...` delay on cold production refreshes.
- Reduce first-render transfer without disabling core chat, workspace, settings, or model configuration.
- Preserve the shared Harness deployment guardrails and deploy only prebuilt artifacts.

## Evidence

- Production server CPU and memory were healthy during the delay.
- Public transfer was approximately 33-65 KB/s.
- The initial application payload was 13.56 MiB uncompressed and took about 100 seconds over the public network.
- The document preview plugin alone was 6.89 MiB because PDF.js worker, cmaps, fonts, and wasm decoders were embedded.
- All local client bundles compressed to 4.02 MiB; excluding document preview reduced this to about 1.04 MiB.

## Checklist

- [x] Capture production bundle sizes and exact URLs after authentication.
- [x] Identify optional heavyweight browser bundles excluded from the shared boot graph.
- [x] Disable only nonessential heavy plugins in the shared deployment overlay.
- [x] Boot the shared composition locally and verify the heavyweight rows leave the graph.
- [x] Measure cold transfer before and after using authenticated public requests with no reusable asset cache.
- [x] Deploy the configuration atomically, verify health and RSS, and avoid restarting the proxy.
- [x] Record lessons.
