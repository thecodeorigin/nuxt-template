import type { RouteLocationRaw } from 'vue-router'
import type { Arrayable } from '@vueuse/core'
import type { Actions, Subjects } from './plugins/casl/ability'
import type { VerticalNavItem } from './@layouts/types'

declare module '#app' {
  interface PageMeta {
    action?: Actions
    subject?: Subjects
    sidebar?: VerticalNavItem
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
