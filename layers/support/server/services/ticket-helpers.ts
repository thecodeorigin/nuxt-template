const DAY_MS = 24 * 60 * 60 * 1000

export function escapeEmailHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function isTicketStale(
  t: { last_message_role: string, last_message_at: Date, status: string, reminder_sent_at: Date | null },
  now: Date,
): boolean {
  if (t.last_message_role !== 'agent')
    return false
  if (t.status === 'closed')
    return false
  if (now.getTime() - t.last_message_at.getTime() < DAY_MS)
    return false
  return t.reminder_sent_at === null || t.reminder_sent_at.getTime() < t.last_message_at.getTime()
}
