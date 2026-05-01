declare module '#app' {
  interface PageMeta {
    public?: boolean
    unauthenticatedOnly?: boolean
    can?: string[]
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    unauthenticatedOnly?: boolean
    can?: string[]
  }
}

export {}
