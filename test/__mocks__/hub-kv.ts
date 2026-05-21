export const kv = {
  get: async (_key: string) => null,
  set: async (_key: string, _value: unknown, _opts?: unknown) => undefined,
  del: async (_key: string) => undefined,
  has: async (_key: string) => false,
  keys: async (_prefix?: string) => [] as string[],
  clear: async (_prefix?: string) => undefined,
}
