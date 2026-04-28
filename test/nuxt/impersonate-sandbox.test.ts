// @vitest-environment nuxt
import type { AuthUser } from '~~/server/utils/auth'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ImpersonatePage from '~/pages/sandbox/impersonate.vue'

const ADMIN: AuthUser = {
  id: 'admin-1',
  primary_email: 'admin@seed.local',
  primary_phone: null,
  username: 'admin',
  name: 'Seed Admin',
  avatar: null,
  verified: true,
  provider: 'google',
  abilities: ['user:impersonate', 'user:read'],
  impersonator: null,
}

const ALICE_AS_IMPERSONATED: AuthUser = {
  id: 'alice-1',
  primary_email: 'alice@seed.local',
  primary_phone: null,
  username: 'alice',
  name: 'Alice',
  avatar: null,
  verified: true,
  provider: 'impersonation',
  abilities: ['todo:read'],
  impersonator: {
    id: ADMIN.id,
    username: ADMIN.username,
    name: ADMIN.name,
    primary_email: ADMIN.primary_email,
    abilities: ADMIN.abilities,
  },
}

const fetchImpersonationCandidates = vi.fn(async () => [
  {
    id: 'alice-1',
    username: 'alice',
    name: 'Alice',
    primary_email: 'alice@seed.local',
    avatar: null,
    abilities: ['todo:read'],
    is_suspended: false,
  },
])

vi.mock('~/api/useAuthApi', () => ({
  useAuthApi: () => ({
    fetchImpersonationCandidates,
    startImpersonation: vi.fn(),
    stopImpersonation: vi.fn(),
    fetchCurrentUser: vi.fn(),
    logout: vi.fn(),
  }),
}))

describe('impersonation sandbox page', () => {
  beforeEach(() => {
    fetchImpersonationCandidates.mockClear()
  })

  it('renders the heading and the candidates list', async () => {
    const auth = useAuthStore()
    auth.currentUser = ADMIN
    const wrapper = await mountSuspended(ImpersonatePage)
    const text = wrapper.text()
    expect(text).toContain('Impersonation sandbox')
    expect(text).toContain('Alice')
  })

  it('shows the impersonator card and badge when impersonating', async () => {
    const auth = useAuthStore()
    auth.currentUser = ALICE_AS_IMPERSONATED
    const wrapper = await mountSuspended(ImpersonatePage)
    expect(wrapper.find('[data-testid="impersonator-card"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="impersonating-badge"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="impersonator-name"]').text()).toContain('Seed Admin')
  })

  it('hides the impersonator card when not impersonating', async () => {
    const auth = useAuthStore()
    auth.currentUser = ADMIN
    const wrapper = await mountSuspended(ImpersonatePage)
    expect(wrapper.find('[data-testid="impersonator-card"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="impersonating-badge"]').exists()).toBe(false)
  })

  it('renders the current user name from the store', async () => {
    const auth = useAuthStore()
    auth.currentUser = ALICE_AS_IMPERSONATED
    const wrapper = await mountSuspended(ImpersonatePage)
    expect(wrapper.find('[data-testid="current-user-name"]').text()).toContain('Alice')
    expect(wrapper.find('[data-testid="current-user-email"]').text()).toContain('alice@seed.local')
  })
})
