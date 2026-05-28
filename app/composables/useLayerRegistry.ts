import type { Component } from 'vue'

export interface RegistryNavItem {
  id: string
  label: string
  icon?: string
  to?: string
  onSelect?: () => void
  /** CASL ability (or array = OR semantics) required to show this item. */
  ability?: string | string[]
  section: 'main' | 'sub' | 'settings'
  priority: number
  type?: 'trigger'
  defaultOpen?: boolean
  children?: RegistryNavItem[]
}

export interface RegistryOverlay {
  id: string
  component: Component
}

export interface RegistryNavbarItem {
  id: string
  component: Component
  priority: number
}

export interface LayerContribution {
  navItems?: RegistryNavItem[]
  overlays?: RegistryOverlay[]
  navbarItems?: RegistryNavbarItem[]
}

export function useLayerRegistry() {
  const navItems = useState<RegistryNavItem[]>('layerRegistry.nav', () => [])
  const overlays = useState<RegistryOverlay[]>('layerRegistry.overlays', () => [])
  const navbarItems = useState<RegistryNavbarItem[]>('layerRegistry.navbar', () => [])

  function contribute(input: LayerContribution) {
    if (input.navItems?.length) {
      const existing = new Set(navItems.value.map(i => i.id))
      navItems.value = [
        ...navItems.value,
        ...input.navItems.filter(i => !existing.has(i.id)),
      ]
    }
    if (input.overlays?.length) {
      const existing = new Set(overlays.value.map(i => i.id))
      overlays.value = [
        ...overlays.value,
        ...input.overlays
          .filter(i => !existing.has(i.id))
          .map(i => ({ ...i, component: markRaw(i.component) })),
      ]
    }
    if (input.navbarItems?.length) {
      const existing = new Set(navbarItems.value.map(i => i.id))
      navbarItems.value = [
        ...navbarItems.value,
        ...input.navbarItems
          .filter(i => !existing.has(i.id))
          .map(i => ({ ...i, component: markRaw(i.component) })),
      ]
    }
  }

  return { navItems, overlays, navbarItems, contribute }
}
