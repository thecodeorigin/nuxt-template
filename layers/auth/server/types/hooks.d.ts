import type { H3Event } from 'h3'

declare module 'nitropack' {
  interface NitroRuntimeHooks {
    'auth:user-created': (p: {
      user: { id: string, primary_email: string, name: string | null, [key: string]: unknown }
      provider: string
      event: H3Event
    }) => void | Promise<void>
  }
}
export {}
