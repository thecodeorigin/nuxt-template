import type { ability } from './ability'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $ability: typeof ability
    $can: (this: this, ...args: Parameters<this['$ability']['can']>) => boolean
  }
}

export {}
