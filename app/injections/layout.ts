import type { EventBusKey } from '@vueuse/core'

export const quickActionBusKey: EventBusKey<void> = Symbol('QuickActionBusKey')
