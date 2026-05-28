import SupportFeedbackModal from '#layers/support/app/components/Support/SupportFeedbackModal.vue'
import SupportTicketModal from '#layers/support/app/components/Support/SupportTicketModal.vue'
import { useFeedbackModalOpen, useSupportTicketOpen } from '#layers/support/app/composables/useSupportModal'

export default defineNuxtPlugin(() => {
  const { contribute } = useLayerRegistry()
  contribute({
    navItems: [
      { id: 'support-requests', label: 'My Requests', icon: 'i-lucide-inbox', to: '/support', section: 'main', priority: 30 },
      {
        id: 'support-feedback',
        label: 'Feedback',
        icon: 'i-lucide-message-circle',
        section: 'sub',
        priority: 10,
        onSelect: () => { useFeedbackModalOpen().value = true },
      },
      {
        id: 'support-ticket',
        label: 'Help & Support',
        icon: 'i-lucide-info',
        section: 'sub',
        priority: 20,
        onSelect: () => { useSupportTicketOpen().value = true },
      },
    ],
    overlays: [
      { id: 'support-feedback-modal', component: SupportFeedbackModal },
      { id: 'support-ticket-modal', component: SupportTicketModal },
    ],
  })
})
