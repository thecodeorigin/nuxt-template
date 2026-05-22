// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import UserMenu from '#layers/auth/app/components/User/UserMenu.vue'

describe('userMenu', () => {
  it('renders the trigger', async () => {
    const wrapper = await mountSuspended(UserMenu)
    expect(wrapper.find('[data-testid="user-menu-trigger"]').exists()).toBe(true)
  })
})
