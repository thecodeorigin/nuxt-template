import type { RouteLocationRaw } from 'vue-router'
import type { Arrayable } from '@vueuse/core'
import type { NavGroupType, NavItem } from '@base/@layouts/types'
import type { z } from 'zod'
import type { HookResult } from '@nuxt/schema'

declare module 'vue-router' {
  interface RouteMeta {
    scopes?: string[]
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

declare module '#app' {
  interface RuntimeNuxtHooks {
    'session:refresh': () => HookResult
  }
}

declare module 'nitropack' {
  interface NitroRuntimeHooks {
    'session:cache:clear': (data: { providerAccountId: string }) => void
    'log:info': (data: { message: string, data?: any }) => void
    'log:error': (data: { message: string, data?: any }) => void
    'credit:change': (data: { userId: string, amount: number }) => void
  }
}

export {}
