import { relations } from 'drizzle-orm/relations'
import { sysUserTable } from '@thecodeorigin/auth'
import { userDeviceTable } from './user_devices.schema'
import { userShortcutTable } from './user_shortcuts.schema'

export const customUserRelations = relations(sysUserTable, ({ many }) => ({
  userShortcuts: many(userShortcutTable),
  userDevices: many(userDeviceTable),
}))
