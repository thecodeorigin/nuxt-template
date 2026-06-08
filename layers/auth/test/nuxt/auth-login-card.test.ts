// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import AuthLoginCard from '#layers/auth/app/components/Auth/AuthLoginCard.vue'

const login = vi.fn(async () => ({ session_id: 's1', user_id: 'u1' }))
const providers = { credential: true, google: false, github: false }

vi.mock('#layers/auth/app/api/useAuthApi', () => ({
  useAuthApi: () => ({
    devSeedUsers: vi.fn(),
    devLogin: vi.fn(),
    fetchAuthProviders: vi.fn(async () => providers),
    login,
  }),
}))

describe('authLoginCard credential form', () => {
  it('renders the credential form when the backend reports credential: true', async () => {
    providers.credential = true
    const wrapper = await mountSuspended(AuthLoginCard)
    expect(wrapper.find('[data-testid="credential-form"]').exists()).toBe(true)
  })

  it('submits email + password through the login API', async () => {
    providers.credential = true
    login.mockClear()
    const wrapper = await mountSuspended(AuthLoginCard)
    await wrapper.find('[data-testid="credential-email"]').setValue('admin@x.dev')
    await wrapper.find('[data-testid="credential-password"]').setValue('secret')
    await wrapper.find('[data-testid="credential-form"]').trigger('submit')
    await new Promise(r => setTimeout(r, 0))
    expect(login).toHaveBeenCalledWith('admin@x.dev', 'secret')
  })

  it('hides the credential form when the backend reports credential: false', async () => {
    providers.credential = false
    const wrapper = await mountSuspended(AuthLoginCard)
    expect(wrapper.find('[data-testid="credential-form"]').exists()).toBe(false)
  })
})
