export function useReferralApi() {
  function fetchReferralStats() {
    return $http<{ code: string, referredCount: number }>('/api/referral/stats')
  }
  return { fetchReferralStats }
}
