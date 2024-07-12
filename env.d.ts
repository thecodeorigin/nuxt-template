import type { RouteLocationRaw } from 'vue-router'
import type { Arrayable } from '@vueuse/core'
import type { Actions, Subjects } from './plugins/casl/ability'
import type { VerticalNavItem } from './@layouts/types'

declare module 'vue-router' {
  interface RouteMeta {
    action?: Actions
    subject?: Subjects
    sidebar?: VerticalNavItem
    layoutWrapperClasses?: string
    navActiveLink?: RouteLocationRaw
    layout?: 'blank' | 'default'
    unauthenticatedOnly?: boolean
    public?: boolean
  }
}

export {}
