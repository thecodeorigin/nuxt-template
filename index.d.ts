import type { RouteLocationRaw } from 'vue-router'
import type { Arrayable } from '@vueuse/core'
import type { Actions, Subjects } from './plugins/casl/ability'

declare module '#app' {
  interface PageMeta {
    action?: Actions
    subject?: Arrayable<Subjects>
    layoutWrapperClasses?: string
    navActiveLink?: RouteLocationRaw

    unauthenticatedOnly?: boolean
    public?: boolean
  }
}

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    //
  }
  interface PublicRuntimeConfig {
    apiBaseUrl: string
  }
}

// It is always important to ensure you import/export something when augmenting a type
export { }
