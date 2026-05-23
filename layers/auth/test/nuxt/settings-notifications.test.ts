// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import NotificationsPage from '#layers/auth/app/pages/settings/notifications.vue'

describe('settings/notifications toggles', () => {
  it('flips a switch and re-renders with the new state', async () => {
    const auth = useAuthStore()
    auth.fetchUserNotificationSettings = vi.fn().mockResolvedValue({
      email: true,
      product_updates: true,
      weekly_digest: true,
      important_updates: true,
    })
    auth.updateUserNotificationSettings = vi.fn().mockResolvedValue({})

    const wrapper = await mountSuspended(NotificationsPage)
    await wrapper.vm.$nextTick()

    const switches = wrapper.findAll('[role="switch"]')
    expect(switches.length).toBeGreaterThan(0)

    // weekly_digest is the 3rd field; find by its current checked state
    const weeklySwitch = switches[2]!
    expect(weeklySwitch.attributes('aria-checked')).toBe('true')

    await weeklySwitch.trigger('click')
    await wrapper.vm.$nextTick()

    expect(weeklySwitch.attributes('aria-checked')).toBe('false')
  })
})
