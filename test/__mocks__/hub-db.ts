export const db = {
  select: () => ({ from: () => ({ where: () => ({ limit: () => [] }), orderBy: () => [] }) }),
  insert: () => ({ values: () => ({ returning: async () => [] }) }),
  update: () => ({ set: () => ({ where: () => ({ returning: async () => [] }) }) }),
  delete: () => ({ where: async () => [] }),
  query: new Proxy({}, { get: () => ({ findFirst: async () => null, findMany: async () => [] }) }),
}

export const schema = {}
