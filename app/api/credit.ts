import type { User } from '@base/server/types/models'

export function useApiCredit() {
  function fetchCredit() {
    // Get user credit from our database instead of depending on Logto data
    return $api<{ data: User }>('/api/auth/me')
  }

  return {
    fetchCredit,
  }
}
