import type { LogtoUser } from '@base/server/types/logto'

export function useApiCredit() {
  function fetchCredit() {
    return $api<{ data: LogtoUser }>('/api/auth/me')
  }

  return {
    fetchCredit,
  }
}
