import { sysUserTable } from '@imrim12/base/schemas'
import { relations } from 'drizzle-orm'
import { userPaymentMethodTable } from '../../../layers/base/server/db/schemas/user_payment_methods.schema'
import { categoryTable } from './category.schema'
import { projectTable } from './project.schema'

export const sysUserScribeRelations = relations(sysUserTable, ({ many }) => ({
  categories: many(categoryTable),
  userPaymentMethods: many(userPaymentMethodTable),
  projects: many(projectTable),
}))
