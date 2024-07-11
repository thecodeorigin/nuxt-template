import type { RouteLocationRaw } from 'vue-router'
import type { Arrayable } from '@vueuse/core'
import type { Actions, Subjects } from './plugins/casl/ability'

declare module 'vue-router' {
  interface RouteMeta {
    action?: Actions
    subject?: Arrayable<Subjects>
    layoutWrapperClasses?: string
    navActiveLink?: RouteLocationRaw
    layout?: 'blank' | 'default'
    unauthenticatedOnly?: boolean
    public?: boolean
  }
}
