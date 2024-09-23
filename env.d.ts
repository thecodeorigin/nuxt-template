import type { RouteLocationRaw } from 'vue-router'
import type { Arrayable } from '@vueuse/core'
import type { Actions, Subjects } from './stores/casl'
import type { NavGroupType, NavItem } from './@layouts/types'

declare module 'vue-router' {
  interface RouteMeta {
    action?: Actions
    subject?: Subjects
    sidebar?: (NavItem & {
      group: NavGroupType
    })
    layoutWrapperClasses?: string
    navActiveLink?: RouteLocationRaw
    layout?: 'blank' | 'default'
    unauthenticatedOnly?: boolean
    public?: boolean
  }
}

export {}
