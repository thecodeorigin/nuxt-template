import type { OrganizationInvitation } from '@nuxthub/db/schema'
import type { H3Event } from 'h3'

declare module 'nitropack' {
  interface NitroRuntimeHooks {
    'auth:user-created': (p: {
      user: { id: string, primary_email: string, name: string | null, [key: string]: unknown }
      provider: string
      event: H3Event
    }) => void | Promise<void>
    /**
     * Fired after an invitation is accepted (membership + role committed) and
     * BEFORE the invitation row is deleted. Listeners MUST be idempotent
     * (onConflictDoNothing) — a thrown listener fails the accept, which is then
     * safely replayable.
     */
    'invitation:accepted': (p: {
      userId: string
      organizationId: string
      invitation: OrganizationInvitation
    }) => void | Promise<void>
  }
}
export {}
