# Progress

## Diagnosis

The production cold refresh downloaded one application combo containing 56
client plugins. The raw payload was 13.56 MiB and a direct public-network
measurement took 99.7 seconds. Server CPU, memory, Harness logs, and proxy logs
were healthy, so the delay was transport volume rather than backend saturation.

`ui-sidebar-documentpreview` was 6.89 MiB because its production client bundle
embedded PDF.js and its worker, cmaps, standard fonts, and wasm decoders. The
other optional marketplace and model-lens bundles used separate external row
IDs (`dsh-market` and `modlens`), so the first disable attempt by package name
did not match.

## Change

The shared deployment overlay now disables:

- `ui-sidebar-documentpreview`
- `dsh-market`
- `modlens`

The core session, chat, workspace, model settings, connection, renderer, locale,
theme, and sidebar plugins remain enabled.

## Verification

- Local smoke boot returned HTTP 200 and removed all three rows from the graph.
- Production graph contains 54 plugins after the final deployment.
- `ui-sidebar-documentpreview`, `dsh-market`, and `modlens` are absent.
- Final production plugin combo transferred 1.70 MiB compressed; one measured
  public download took 17.2 seconds at 98.6 KB/s.
- Repeated production index requests completed in 0.12-0.30 seconds.
- Harness and proxy are active. Harness RSS was 297.1 MiB and swap was 0B.
- The proxy was not restarted.

## Deployment

- Commits: `b22eedd` and `0c6b5b8` on `master`.
- Both commits were pushed to `origin/master`.
- The production overlay was transferred with SHA-256 verification and installed
  atomically after timestamped backups.
- Only `dsh-shared-harness.service` was restarted, once per overlay correction.

## Tradeoff

The shared server temporarily has no PDF preview. Markdown, text, code, image,
and HTML preview still remain with the lightweight document-preview plugin. A
permanent solution should split PDF.js into an explicitly opt-in lazy browser
tier so private deployments can enable PDF without adding it to every shared
cold refresh.
