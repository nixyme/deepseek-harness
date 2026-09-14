# PDF lazy loading plan

## Goal

- Restore PDF preview on the shared server without returning it to the initial browser payload.
- Keep every existing preview feature, including worker, CMap, standard font, wasm, and license assets.
- Show an explicit loading state while the PDF engine activates and make failures retryable.
- Cache transport bytes through immutable production URLs and cache concurrent/repeated activation at the application layer.

## Design

1. Extend the boot protocol with an optional `lazy` boolean on `dsh.client`, graph rows, module rows, and plugin rows.
2. Keep lazy rows globally addressable in the graph, but exclude them from bootstrap and application batches and from eager boot activation.
3. Move the complete PDF renderer from `ui-sidebar-documentpreview` into a new lazy companion package.
4. Register a lightweight PDF placeholder in the base document-preview package. Opening a PDF activates the companion before rendering bytes.
5. Deduplicate concurrent PDF activation and discard failed activation tasks so retry can recreate the entry.
6. Declare the shared `LoadingIndicator` as a non-default external module request in the PDF package manifest, preserving plugin runtime identity.

## Safety

- Build only locally; production may receive artifacts and configuration only.
- Restart shared Harness and proxy separately, with health checks between stages.
- Preserve pre-change production configuration and artifact backups.
