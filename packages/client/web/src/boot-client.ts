/**
 * Production client composition without the page: mount the Loader over a
 * module system, create every eager manifest row, wait for quiescence, and audit
 * activation. `AppWebEntry` and the whole-client test carrier both call it.
 * @module @deepseek-ai/dsh-client-web/src/boot-client
 */
import type { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import type { BootManifest, ClientModuleLoader } from '@deepseek-ai/dsh-client-modules/client'
import { STATE_LABELS } from './loader-status.ts'

/** Entry state label as the boot page renders it. */
export type EntryStateLabel = (typeof STATE_LABELS)[keyof typeof STATE_LABELS] | 'loading' | 'failed'

/** Inputs of {@link bootClient}. */
export interface ClientBootOptions {
  /** Fresh root Context that will own the plugin tree. */
  readonly ctx: Context
  /** Module system installed as `loader.internal`. */
  readonly modules: ClientModuleLoader
  /** Parsed manifest whose `plugins` rows become Loader entries (entry name = row id). */
  readonly manifest: BootManifest
  /** Per-entry state reporting (the boot page); omitted when no one renders progress. */
  readonly onEntryState?: (name: string, state: EntryStateLabel) => void
}

/**
 * Compose the client: `ctx.plugin(Loader)`, `loader.internal = modules`, one
 * `loader.create({ name })` per manifest row, `loader.await()`, then
 * {@link assertEntriesActive}. A row whose module cannot be imported rejects
 * `loader.create`, so that import error propagates from here as-is.
 * @param options - context, module system, manifest, optional progress sink.
 * @returns resolves after every entry is active; rejects with the audit report otherwise.
 */
export async function bootClient(options: ClientBootOptions): Promise<void> {
  const { ctx, manifest, onEntryState } = options
  await ctx.plugin(Loader)
  const loader = ctx.loader
  loader.internal = options.modules as never

  ctx.on('internal/status', (fiber) => {
    const entry = fiber.entry
    if (entry === undefined || entry.fiber === undefined) return
    onEntryState?.(entry.options.name, STATE_LABELS[entry.fiber.state])
  })

  const rows = manifest.plugins.filter(row => !row.lazy).map(row => row.id)
  await Promise.all(rows.map(async (name) => {
    onEntryState?.(name, 'loading')
    const id = await loader.create({ name })
    if (loader.resolve(id).fiber === undefined) onEntryState?.(name, 'failed')
  }))

  await loader.await()
  assertEntriesActive(ctx)
}

/** Per-Loader activation queue: concurrent requests for one lazy entry share one task and one failure. */
const lazyActivations = new WeakMap<object, Map<string, Promise<void>>>()

/**
 * Activate one lazy graph row after boot. Browser HTTP caching owns repeat bytes; this
 * owns concurrent and repeated Cordis activation. A failed task is forgotten so the next
 * call can retry; a failed in-tree entry is removed before that retry recreates it.
 * @param ctx - booted root Context carrying the Loader.
 * @param name - lazy manifest row id, also the Loader entry name.
 * @returns resolves when the entry fiber reports `active`.
 */
export function activateLazyClientPlugin(ctx: Context, name: string): Promise<void> {
  const loader = ctx.loader
  let byName = lazyActivations.get(loader)
  if (byName === undefined) {
    byName = new Map()
    lazyActivations.set(loader, byName)
  }
  const pending = byName.get(name)
  if (pending !== undefined) return pending
  const task = (async(): Promise<void> => {
    const existing = [...loader.entries()].find(entry => entry.options.name === name)
    if (existing?.fiber !== undefined) {
      await existing.fiber.await()
      if (STATE_LABELS[existing.fiber.state] === 'active') return
      await loader.remove(existing.id)
    }
    const id = await loader.create({ name })
    const entry = loader.resolve(id)
    const fiber = entry.fiber
    if (fiber === undefined || STATE_LABELS[fiber.state] !== 'active') {
      throw new Error(`web boot: lazy entry "${name}" did not activate`)
    }
    await fiber.await()
    if (STATE_LABELS[fiber.state] !== 'active') throw new Error(`web boot: lazy entry "${name}" did not activate`)
  })()
  byName.set(name, task)
  void task.catch(() => { byName.delete(name) })
  return task
}

/**
 * Reject entries that failed import/apply or still wait on missing services.
 * @param ctx - root Context carrying the Loader.
 * @throws {Error} listing every non-active entry with its reason.
 */
export function assertEntriesActive(ctx: Context): void {
  const failures: string[] = []
  for (const entry of ctx.loader.entries()) {
    const name = entry.options.name
    if (entry.fiber === undefined) {
      failures.push(`${name}: import failed (see console for the import error)`)
      continue
    }
    const state = STATE_LABELS[entry.fiber.state]
    if (state === 'active') continue
    if (state === 'pending') {
      const missing = Object.keys(entry.fiber.inject).filter(service => ctx.get(service) === undefined)
      failures.push(`${name}: pending (waiting for service${missing.length === 1 ? '' : 's'}: ${missing.join(', ') || 'unknown'})`)
    } else {
      failures.push(`${name}: ${state}`)
    }
  }
  if (failures.length > 0) {
    throw new Error(`web boot: ${String(failures.length)} entr${failures.length === 1 ? 'y' : 'ies'} did not activate\n${failures.join('\n')}`)
  }
}
