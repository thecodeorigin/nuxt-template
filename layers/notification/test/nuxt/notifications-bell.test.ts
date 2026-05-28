// @vitest-environment nuxt
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import NotificationsBell from '#layers/notification/app/components/Notifications/NotificationsBell.vue'

registerEndpoint('/api/notifications/unread-count', () => ({ count: 3 }))

describe('notificationsBell', () => {
  it('shows the bell button', async () => {
    const wrapper = await mountSuspended(NotificationsBell)
    expect(wrapper.find('[data-testid="notifications-bell"]').exists()).toBe(true)
  })
})
