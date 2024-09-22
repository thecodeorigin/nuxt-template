import type { NuxtApp } from '#app'

export function runWithNuxt(nuxtApp: NuxtApp, callback: (...args: any[]) => void) {
  nuxtApp.runWithContext(callback)
}
