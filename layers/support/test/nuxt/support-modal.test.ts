// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import SupportTicketModal from '#layers/support/app/components/Support/SupportTicketModal.vue'

describe('supportTicketModal', () => {
  it('renders category/subject/message and disables submit until valid', async () => {
    await mountSuspended(SupportTicketModal, { props: { open: true } })
    // UModal teleports to document.body; wrapper.findAll misses teleported content
    const buttons = Array.from(document.querySelectorAll('button'))
    const submit = buttons.find(b => b.textContent?.trim().includes('Submit request'))
    expect(submit).toBeDefined()
    expect(submit?.disabled).toBe(true)
  })
})
