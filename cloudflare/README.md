# Cloudflare-specific infrastructure

Platform glue that isn't domain logic and doesn't belong in a feature layer.
Each file here is a thin, reusable wrapper over a Cloudflare Workers primitive;
the domain code lives in the layers and calls into it.

| File | What it is |
|------|------------|
| `queue.ts` | Producer-side helper for **Cloudflare Queues** (`QueueProducer`, `getQueueProducer`, `enqueue`, `chunk`). Pure/runtime; unit-tested in `test/unit/cloudflare-queue.test.ts`. |

Why a root `cloudflare/` folder instead of `server/utils/`: these helpers are
Cloudflare-specific and may be consumed by any layer (server **or**, in
principle, edge code). Server code imports them with the project-root alias,
e.g. `import { getQueueProducer } from '~~/cloudflare/queue'`.

> The matching **consumer** is a Nitro plugin, not a file here — it must live
> under a scanned `server/` dir to be registered. See
> `layers/system/server/plugins/dispatch-queue.consumer.ts`, which listens on
> the `cloudflare:queue` hook (fired by Nitro's `cloudflare_module` preset). The
> hook's type augmentation is in `layers/system/server/types/hooks.d.ts`.

---

## Cloudflare Queues — bulk email dispatch

The admin "Send email" tool (`layers/system`) can target up to 500 recipients.
Sending them inline inside one request risks the Worker CPU/wall-time limit. The
queue path fans recipients out as messages drained in the background, with
per-message retries and a dead-letter queue.

**Design**

1. The route composes the email once, stores it in KV (`dispatch:job:{id}`,
   1‑hour TTL), and enqueues one small message per recipient
   (`{ dispatchId, user }`) wrapped in a `{ type, payload }` envelope.
2. The consumer plugin loads the shared email blob by `dispatchId` and sends to
   each recipient via the `sendUserEmail` opt-out chokepoint. It `ack()`s on
   success and `retry()`s on failure (single-recipient granularity).

**Graceful fallback** — if the `DISPATCH_QUEUE` binding is absent (local
`pnpm dev`, tests, or simply not yet configured), `getQueueProducer` returns
`null` and the route sends synchronously, exactly as before. So the feature is
safe-by-default and *activates the moment the binding exists* — no code change.

### Enabling it (production)

Requires a **paid Workers plan** (Queues is not on the free tier).

```bash
# 1. Create the queue and its dead-letter queue
npx wrangler queues create nuxt-template-dispatch
npx wrangler queues create nuxt-template-dispatch-dlq

# 2. Uncomment the "queues" block in wrangler.jsonc (producer + consumer + DLQ).
#    NuxtHub merges it into .output/server/wrangler.json at build.

# 3. Deploy as usual (CI `wrangler deploy`, or locally):
pnpm build && npx wrangler --cwd .output deploy
```

The binding name (`DISPATCH_QUEUE`), queue name (`nuxt-template-dispatch`), and
message type live in `layers/system/server/services/dispatch.ts` — keep
wrangler.jsonc in sync with those constants.

### Environment isolation ⚠️

Preview and production share this top-level `queues` config (there is no
per-`CLOUDFLARE_ENV` indirection as there is for D1/KV). If you run real preview
deploys that send mail, create a **separate** queue per environment (e.g.
`nuxt-template-dispatch-preview`) and switch the names via a wrangler `env`
block, or leave the queue unconfigured on preview so it falls back to inline
send.

### Local testing

`wrangler dev` can emulate queues, but `pnpm dev` runs Nitro's Node dev server
where the binding is absent — dispatch sends synchronously there, which is the
intended dev behavior. Exercise the queue path against a real preview/prod
Worker, or with `wrangler dev` + a bound queue.
