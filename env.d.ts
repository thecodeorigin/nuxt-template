import type { RouteLocationRaw } from 'vue-router'
import type { Arrayable } from '@vueuse/core'
import type { Actions, Subjects } from './layers/materialize/app/utils/casl'
import type { NavGroupType, NavItem } from './layers/materialize/app/@materialize/@layouts/types'
import type { Page } from 'puppeteer'

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

declare global {
  var $page: Page
}

export {}
