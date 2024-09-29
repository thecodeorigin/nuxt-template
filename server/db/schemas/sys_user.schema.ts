import { sysUserTable } from '@imrim12/materialize/schemas'
import { relations } from 'drizzle-orm'
import { categoryTable } from './category.schema'
import { postTable } from './post.schema'
import { projectTable } from './project.schema'
import { userPaymentMethodTable } from './user_payment_methods.schema'

export const sysUserScribeRelations = relations(sysUserTable, ({ many }) => ({
  categories: many(categoryTable),
  posts: many(postTable),
  userPaymentMethods: many(userPaymentMethodTable),
  projects: many(projectTable),
}))
