# PDF lazy loading checklist

- [x] Add lazy protocol validation and wire parsing.
- [x] Keep lazy graph rows out of every startup batch.
- [x] Defer lazy rows during client boot while keeping them available on demand.
- [x] Split PDF.js and all supporting assets into a dedicated lazy package.
- [x] Remove PDF runtime dependencies from the lightweight document-preview package.
- [x] Add PDF activation loading, failure, and retry UI.
- [x] Deduplicate concurrent activation and allow failed activation retry.
- [x] Declare cross-plugin external runtime edges required by bundle purity.
- [x] Re-enable the full document-preview package in the shared deployment overlay.
- [x] Regenerate module graph and workspace catalogs.
- [x] Run production build locally.
- [x] Run PDF, module, boot, document-preview, roster, and catalog tests.
- [x] Run client TypeScript build.
- [x] Audit production boot graph and verify PDF is lazy and absent from batches.
- [ ] Commit and push the final source and artifact digest.
- [ ] Deploy prebuilt artifacts with staged health checks.
- [ ] Verify cold index/application transfer and lazy PDF bundle behavior.
- [ ] Archive processing records after production acceptance.
