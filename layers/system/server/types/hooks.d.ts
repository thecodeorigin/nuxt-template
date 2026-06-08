// The `cloudflare:queue` hook is fired by Nitro's cloudflare_module preset for
// every batch from a bound consumer queue (see nitropack cloudflare runtime
// `_module-handler`). It is declared here — the system layer is its only
// consumer (bulk email dispatch). Types are inlined to avoid a hard dependency
// on @cloudflare/workers-types.
interface CfQueueMessage {
  readonly id: string
  readonly body: unknown
  ack: () => void
  retry: (options?: { delaySeconds?: number }) => void
}
interface CfMessageBatch {
  readonly queue: string
  readonly messages: readonly CfQueueMessage[]
}

declare module 'nitropack' {
  interface NitroRuntimeHooks {
    'cloudflare:queue': (p: { batch: CfMessageBatch, env: unknown, context: unknown }) => void | Promise<void>
  }
}
export {}
