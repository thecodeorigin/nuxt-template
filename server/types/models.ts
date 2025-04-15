import type { InferSelectModel } from 'drizzle-orm'
import type {
  creditHistoryTable,
  creditPackageTable,
  deviceTable,
  identityTable,
  notificationTable,
  orderTable,
  paymentProviderTransactionTable,
  paymentTable,
  userTable,
} from '../db/schemas'

/**
 * Database model types derived from schema tables
 */
export type User = InferSelectModel<typeof userTable>
export type Identity = InferSelectModel<typeof identityTable>
export type Notification = InferSelectModel<typeof notificationTable>
export type CreditHistory = InferSelectModel<typeof creditHistoryTable>
export type Order = InferSelectModel<typeof orderTable>
export type Payment = InferSelectModel<typeof paymentTable>
export type PaymentProviderTransaction = InferSelectModel<typeof paymentProviderTransactionTable>
export type CreditPackage = InferSelectModel<typeof creditPackageTable>
export type Device = InferSelectModel<typeof deviceTable>

/**
 * Utility types for handling nullable values consistently
 */
export type Nullable<T> = T | null

/**
 * Makes all properties in an object nullable
 */
export type NullableProps<T> = {
  [P in keyof T]: Nullable<T[P]>
}

/**
 * Makes all properties optional
 */
export type Optional<T> = {
  [P in keyof T]?: T[P]
}

/**
 * Combines properties being both optional and nullable
 */
export type OptionalNullable<T> = Optional<NullableProps<T>>

/**
 * Creates a user input type with specific included fields only
 */
export type UserInput = OptionalNullable<
  Pick<User, 'name' |
  'username' |
  'primary_email' |
  'primary_phone' |
  'avatar' |
  'facebook' |
  'zalo' |
  'credit' |
  'custom_data' |
  'last_sign_in_at' |
  'is_suspended' |
  'has_password' >
>

/**
 * Type for basic filter pagination
 */
export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortAsc?: boolean
  keyword?: string
  keywordLower?: string
  withCount?: boolean
}

/**
 * Type for API responses with pagination
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
}
