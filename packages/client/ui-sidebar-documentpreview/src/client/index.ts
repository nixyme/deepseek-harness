/**
 * Browser half: register `text` as a right-Sidebar tab type.
 *
 * The type reaches the Sidebar through its public path only: the definition into
 * `ctx.sidebarRightTabs`, the body into the keyed `sidebar.right.pane.tab`
 * seat, and the chip title into `sidebar.right.pane.tab.title`, both under the
 * definition's `id`. Nothing here reaches into the Sidebar's store, its
 * panes, or its sequence. The file's metadata comes from the standard
 * `useResource`, served by the `file` provider; the content is this type's own
 * business, read through its face. Every import from another
 * client plugin is a type.
 */
import type { Context as ClientContext, FiberState } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type { Loader } from '@deepseek-ai/cordis-plugin-loader'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-resources/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type {} from '@deepseek-ai/dsh-api-gateway/client'
import type {} from '@deepseek-ai/dsh-api-workspace-files/remote'
import type { WorkspaceFileParams } from '@deepseek-ai/dsh-api-workspace-files/client'
import { TextPreview } from './TextPreview.tsx'
import type { TextPreviewInjected } from './TextPreview.tsx'
import { TextTitle } from './TextTitle.tsx'
import { TEXTPREVIEW_ID, textDefinition } from './definition.ts'
import { textFace } from './face.ts'
import { createReadPage } from './rpc.ts'
import { createTextStore } from './store.ts'
import { en, zh } from './locales.ts'
import { DocumentPreviewRegistry } from './document/registry.ts'
import { documentTabInfoFactory } from './document/contract.ts'
export { LoadingIndicator } from './LoadingIndicator.tsx'
import { apply as registerText } from './text/index.ts'
import { apply as registerMarkdown } from './markdown/index.ts'
import { apply as registerHtml } from './html/index.ts'
import { apply as registerImage } from './image/index.ts'
import { apply as registerCode } from './code/index.ts'

// Values stay package-private unless another package needs them; the plugin
// surface is `apply`, `inject`, and the store factory another registration may
// share, plus the types a consumer of the seat or the store names.
export type { SidebarDocumentPreviewKey } from './locales.ts'
export type { TextPreviewProps } from './TextPreview.tsx'
export type { TextInjected } from './face.ts'
export type { ReadWorkspaceFilePage, SessionFile, WorkspaceFilesReadRemote } from './rpc.ts'
export type { TextPage, TextState, TextStore, TextTabState } from './store.ts'
export type { DocumentContent, DocumentPreviewProps, DocumentTextPage } from './document/contract.ts'
export type { DocumentLoadMode, DocumentPreviewDefinition } from './document/registry.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** File-extension renderer registrations, independent from their keyed document bodies. */
    documentPreviews: DocumentPreviewRegistry
  }
}

/** This package's copy namespace. */
const NS = 'sidebarDocumentPreview'

/** Lazy companion package mounted only when the reader opens a PDF. */
const PDF_PLUGIN_ID = '@deepseek-ai/dsh-client-ui-sidebar-documentpreview-pdf'

/** Runtime mirror of cordis FiberState.ACTIVE; the vendored const enum cannot cross bundle faces. */
const ACTIVE_FIBER_STATE = 2 as FiberState

declare module '@deepseek-ai/dsh-client-ui-sidebar-right/client' {
  interface SidebarRightResourceParamsMap {
    /** File line navigation supported by the text preview. */
    file: WorkspaceFileParams
  }
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Text-preview progress, paging, change, control, and failure lines. */
    sidebarDocumentPreview: import('./locales.ts').SidebarDocumentPreviewKey
  }
}

/**
 * Required browser services: the tab registry, the slot registry, copy, and the
 * Remote carrier with its `workspaceFiles` namespace.
 */
export const inject = ['slots', 'locale', 'sidebarRightTabs', 'remote', 'remote.workspaceFiles']

/**
 * Client plugin body: register the type, its dictionaries, its body, and its chip title.
 * @param ctx - client root context carrying the registry, the slots, copy, and the Remote face.
 */
export function apply(ctx: ClientContext): void {
  const previews = new DocumentPreviewRegistry()
  const disposePreviews = ctx.reflect.provide('documentPreviews', previews)
  ctx.effect(() => disposePreviews)
  ctx.effect(() => ctx.sidebarRightTabs.register(textDefinition()), 'ui-sidebar-documentpreview: text type')
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-sidebar-documentpreview: dictionaries')

  const store = createTextStore()
  const face = textFace(
    createReadPage(ctx.remote),
    (file, signal) => ctx.remote.workspaceFiles.readAll(file.sessionId, file.path, signal),
  )
  const source = { getSnapshot: previews.getSnapshot, subscribe: previews.subscribe }
  const pdfActivations = new Map<string, Promise<void>>()
  const activatePdf = (): Promise<void> => {
    const pending = pdfActivations.get(PDF_PLUGIN_ID)
    if (pending !== undefined) return pending
    const task = (async(): Promise<void> => {
      const loader: Loader = ctx.loader
      const existing = [...loader.entries()].find(entry => entry.options.name === PDF_PLUGIN_ID)
      if (existing?.fiber !== undefined) {
        await existing.fiber.await()
        if (existing.fiber.state === ACTIVE_FIBER_STATE) return
        await loader.remove(existing.id)
      }
      const id = await loader.create({ name: PDF_PLUGIN_ID })
      const entry = loader.resolve(id)
      const fiber = entry.fiber
      if (fiber === undefined) throw new Error('ui-sidebar-documentpreview: lazy PDF entry did not activate')
      await fiber.await()
      if (fiber.state !== ACTIVE_FIBER_STATE) throw new Error('ui-sidebar-documentpreview: lazy PDF entry did not activate')
    })()
    pdfActivations.set(PDF_PLUGIN_ID, task)
    void task.catch(() => { pdfActivations.delete(PDF_PLUGIN_ID) })
    return task
  }
  ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register(
    {
      name: 'sidebar.right.pane.tab', key: TEXTPREVIEW_ID, locale: NS, store,
      children: {
        'sidebar.right.tab.document': { kind: 'keyed', scope: 'session', inject: { hooks: { tabInfo: documentTabInfoFactory } } },
      },
      inject: (sessionId, actions): TextPreviewInjected => ({
        ...face(sessionId, actions), activatePdf, hooks: { documentPreviews: source },
      }),
    },
    TextPreview,
  )), 'ui-sidebar-documentpreview: text body')
  ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register(
    { name: 'sidebar.right.pane.tab.title', key: TEXTPREVIEW_ID },
    TextTitle,
  )), 'ui-sidebar-documentpreview: text title')
  registerText(ctx)
  registerMarkdown(ctx)
  registerHtml(ctx)
  registerImage(ctx)
  registerCode(ctx)
}
