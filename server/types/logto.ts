import type { UserInfoResponse } from '@logto/nuxt'

export interface LogtoUser extends UserInfoResponse {
  custom_data: {
    credit?: number
    email?: boolean
    desktop?: boolean
    product_updates?: boolean
    weekly_digest?: boolean
    important_updates?: boolean
  }
}
