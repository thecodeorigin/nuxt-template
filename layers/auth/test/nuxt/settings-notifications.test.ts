// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import NotificationsPage from '#layers/auth/app/pages/settings/notifications.vue'

function mockStore(prefs = { email: true, product_updates: true, weekly_digest: true, important_updates: true }) {
  const auth = useAuthStore()
  auth.fetchUserNotificationSettings = vi.fn().mockResolvedValue(prefs)
  auth.updateUserNotificationSettings = vi.fn().mockResolvedValue({})
  return auth
}

describe('settings/notifications', () => {
  it('flips a sub-switch and re-renders', async () => {
    mockStore()
    const wrapper = await mountSuspended(NotificationsPage)
    await wrapper.vm.$nextTick()
    const weekly = wrapper.findAll('[role="switch"]')[2]!
    expect(weekly.attributes('aria-checked')).toBe('true')
    await weekly.trigger('click')
    await wrapper.vm.$nextTick()
    expect(weekly.attributes('aria-checked')).toBe('false')
  })

  it('does NOT persist when the email master is toggled off (gated by the dialog)', async () => {
    const auth = mockStore()
    const wrapper = await mountSuspended(NotificationsPage)
    await wrapper.vm.$nextTick()
    const email = wrapper.findAll('[role="switch"]')[0]!
    await email.trigger('click')
    await wrapper.vm.$nextTick()
    expect(email.attributes('aria-checked')).toBe('false')
    expect(auth.updateUserNotificationSettings).not.toHaveBeenCalled()
  })

  it('persists email:false after confirming the destructive dialog', async () => {
    const auth = mockStore()
    const wrapper = await mountSuspended(NotificationsPage)
    await wrapper.vm.$nextTick()
    await wrapper.findAll('[role="switch"]')[0]!.trigger('click')
    await wrapper.vm.$nextTick()

    // UModal teleports to <body>; find the confirm button by label.
    const confirm = [...document.querySelectorAll('button')].find(b => b.textContent?.includes('Turn off all email'))
    expect(confirm).toBeTruthy()
    confirm!.click()
    await wrapper.vm.$nextTick()
    expect(auth.updateUserNotificationSettings).toHaveBeenCalledWith(expect.objectContaining({ email: false }))
  })
})
