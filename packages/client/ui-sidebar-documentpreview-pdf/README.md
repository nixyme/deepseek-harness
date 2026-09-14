---
description: "Lazy PDF renderer for the right Sidebar document preview: complete PDF.js rendering loaded only when a reader opens a PDF."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-sidebar-documentpreview-pdf

English | [中文](README.zh.md)

## Summary

This lazy companion to `ui-sidebar-documentpreview` renders PDF files in the right Sidebar. The Host keeps its immutable bundle in the client graph for caching and hot reload, but omits it from first-screen batches and boot activation. The lightweight document preview requests this package when a PDF opens, shows localized loading progress, and offers retry after activation failure. The bundle owns PDF.js, its worker, cmaps, standard fonts, wasm decoders, licenses, and the PDF document store.

## Model Experience

None, as this package is a browser-only viewer that registers no tool, prompt section, or session event.

#### KV Cache effect

No direct effect; rendered PDF bytes and pages never enter a model request.

## Known Limitations and Deferred Work

- **Activation is browser-local.** Closing the tab disposes renderer UI state; the immutable plugin bundle remains in the browser HTTP cache.
- **Complete files only.** PDF reads follow the document preview's `maxFileBytes` limit.
- **Application-layer lazy loading.** Once the browser has fetched the bundle, opening another PDF does not download it again.

<a id="dev-note"></a>
## Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

`dsh.client.lazy` is a boot protocol tier, not a special case in the PDF renderer. Host composition keeps the row graph-addressable but leaves it out of every application combo; `bootClient` skips it; the document preview creates its Cordis entry on demand.

</details>

**Runtime invariant:** PDF metadata and the keyed body register only after lazy activation; the lightweight preview never imports this package's runtime. No runtime invariant companion is published because activation, registration, disposal, and rendering are observable only through the document-preview slot integration covered by behavior tests.
