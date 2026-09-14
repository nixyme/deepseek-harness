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
