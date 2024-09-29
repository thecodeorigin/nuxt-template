import type { RouteLocationRaw } from 'vue-router'
import type { Arrayable } from '@vueuse/core'
import type { Page } from 'puppeteer'
import type { Actions, Subjects } from './layers/base/app/utils/casl'
import type { NavGroupType, NavItem } from './layers/base/app/@base/@layouts/types'

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
  // eslint-disable-next-line vars-on-top
  var $page: Page
}

export {}
