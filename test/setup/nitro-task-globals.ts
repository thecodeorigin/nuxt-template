// Nitro auto-imports defineTask/runTask at runtime. Node-env unit tests import
// server/tasks/* modules for their named exports (fixtures, seed fns), which
// triggers the top-level defineTask() call — shim it to a no-op pass-through.
const g = globalThis as Record<string, unknown>
g.defineTask ??= (def: unknown) => def
g.runTask ??= async () => ({ result: undefined })
