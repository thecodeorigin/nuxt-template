import type { HookResult } from '@nuxt/schema'
import type { Page } from 'puppeteer'

declare global {
  // eslint-disable-next-line vars-on-top
  var $page: Page
}

declare module '#app' {
  interface RuntimeNuxtHooks {
    'session:refresh': () => HookResult
  }
}

declare module 'nitropack' {
  interface NitroRuntimeHooks {
    'session:cache:clear': (data: { sub: string }) => void
    'log:info': (data: { message: string, data?: any }) => void
    'log:error': (data: { message: string, data?: any }) => void
    'credit:change': (data: { userId: string, amount: number }) => void
  }
}

export {}
