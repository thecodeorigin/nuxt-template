import type { Component, InjectionKey } from 'vue'

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

export interface RegistryInvitationField {
  id: string
  component: Component
}

/**
 * Provided by the invite form; injected by contributed fields to write their
 *  slice of the invitation payload. Scoped per form instance.
 */
export const invitationMetadataKey: InjectionKey<Record<string, unknown>> = Symbol('invitation-metadata')

export interface LayerContribution {
  navItems?: RegistryNavItem[]
  overlays?: RegistryOverlay[]
  navbarItems?: RegistryNavbarItem[]
  invitationFields?: RegistryInvitationField[]
}

export function useLayerRegistry() {
  const navItems = useState<RegistryNavItem[]>('layerRegistry.nav', () => [])
  const overlays = useState<RegistryOverlay[]>('layerRegistry.overlays', () => [])
  const navbarItems = useState<RegistryNavbarItem[]>('layerRegistry.navbar', () => [])
  const invitationFields = useState<RegistryInvitationField[]>('layerRegistry.invitationFields', () => [])

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
    if (input.invitationFields?.length) {
      const existing = new Set(invitationFields.value.map(i => i.id))
      invitationFields.value = [
        ...invitationFields.value,
        ...input.invitationFields
          .filter(i => !existing.has(i.id))
          .map(i => ({ ...i, component: markRaw(i.component) })),
      ]
    }
  }

  return { navItems, overlays, navbarItems, invitationFields, contribute }
}
