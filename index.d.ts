import type { RouteLocationRaw } from 'vue-router'
import type { Arrayable } from '@vueuse/core'
import type { Actions } from './app/stores/casl'
import type { NavGroupType, NavItem } from './app/@base/@layouts/types'

declare module '#app' {
  interface PageMeta {
    action?: Actions
    subject?: string
    sidebar?: (NavItem & {
      group: NavGroupType
    })
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
