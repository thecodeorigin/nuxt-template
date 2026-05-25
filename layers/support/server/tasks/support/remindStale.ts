import { defineScheduledTask } from '~~/server/utils/cron'
import { sendTicketReminders } from '#layers/support/server/services/ticket'

export default defineScheduledTask('0 * * * *', {
  meta: {
    name: 'support:remindStale',
    description: 'Email users who have not replied to a support agent in 24h.',
  },
  run: async () => ({ result: await sendTicketReminders() }),
})
