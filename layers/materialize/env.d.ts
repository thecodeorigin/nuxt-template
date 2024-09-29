import type { selectSysUserSchema } from './server/db/schemas'

declare module 'nitropack' {
  interface NitroRuntimeHooks {
    'user:created': (data: z.infer<typeof selectSysUserSchema>) => void
    'user:get': (data: z.infer<typeof selectSysUserSchema>) => void
  }
}
