import type { RouteLocationRaw } from 'vue-router'
import type { Arrayable } from '@vueuse/core'
import type { Page } from 'puppeteer'
import type { Actions, Subjects } from '@base/utils/casl'
import type { NavGroupType, NavItem } from '@base/@layouts/types'
import type { selectSysUserSchema } from './server/db/schemas'

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
    'user:created': (data: z.infer<typeof selectSysUserSchema>) => void
    'user:get': (data: z.infer<typeof selectSysUserSchema>) => void
  }
}

export {}
