import type { ExtractResponse } from '~/types/utils'

export function useReferralApi() {
  function fetchReferralStats() {
    return $http('/api/referral/stats')
  }
  return { fetchReferralStats }
}

export type ReferralStats = NonNullable<ExtractResponse<typeof useReferralApi, 'fetchReferralStats'>>
export type ReferralEntry = ReferralStats['referrals'][number]
