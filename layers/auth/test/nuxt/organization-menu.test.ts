// @vitest-environment nuxt
import type { AuthUser } from '#layers/auth/server/services/auth'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import OrganizationMenu from '#layers/auth/app/components/Organization/OrganizationMenu.vue'

vi.mock('#layers/auth/app/api/useOrganizationApi', () => ({
  useOrganizationApi: () => ({
    fetchOrganization: () => Promise.resolve({
      id: 'org-1',
      name: 'Demo Organization',
      slug: 'demo-organization',
      is_system: false,
      is_personal: true,
      memberCount: 1,
    }),
    fetchOrganizations: () => Promise.resolve({ items: [], hasMore: false }),
  }),
}))

const USER: AuthUser = {
  id: 'u1',
  primary_email: 'user@seed.local',
  primary_phone: null,
  username: 'user',
  name: 'User Agent',
  avatar: null,
  bio: null,
  verified: true,
  provider: 'demo',
  abilities: ['user:read'],
  activeOrganizationId: 'org-1',
  impersonator: null,
}

describe('organizationMenu', () => {
  it('shows the active organization name without opening the popover', async () => {
    const auth = useAuthStore()
    auth.currentUser = USER

    const wrapper = await mountSuspended(OrganizationMenu)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Demo Organization')
    expect(wrapper.text()).not.toContain('User Agent')
  })
})
