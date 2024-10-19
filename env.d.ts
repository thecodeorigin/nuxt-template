import type { RouteLocationRaw } from 'vue-router'
import type { Arrayable } from '@vueuse/core'
import type { Page } from 'puppeteer'
import type { NavGroupType, NavItem } from '@base/@layouts/types'
import type { z } from 'zod'
import type { sysUserTable } from './server/db/schemas'
import type { Actions, Subjects } from '~/stores/casl'

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

declare module 'nitropack' {
  interface NitroRuntimeHooks {
    'user:created': (data: typeof sysUserTable.$inferSelect) => void
  }
}

export {}
